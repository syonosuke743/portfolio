import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleMapsService } from '../google-maps/google-maps.service';
import { WaypointType, AdventureStatus } from '@prisma/client';
import {CreateAdventureDto,}from '../adventures/dto/create-adventure.dto'

@Injectable()
export class AdventuresService {
  private readonly logger = new Logger(AdventuresService.name);

  constructor(
    private prisma: PrismaService,
    private googleMapsService: GoogleMapsService,
  ) {}

  async create(createAdventureDto: CreateAdventureDto) {
    const { waypoints, ...adventureData } = createAdventureDto;
    let adventure: any = null;

    try {
      // 1. Adventure作成（waypointsも同時作成）
      adventure = await this.prisma.adventure.create({
        data: {
          ...adventureData,
          waypoints: {
            create: waypoints.map((waypoint) => ({
              sequence: waypoint.sequence,
              waypointType: waypoint.waypointType,
              poiCategory: waypoint.poiCategory,
              latitude: waypoint.latitude,
              longitude: waypoint.longitude,
              locationName: waypoint.locationName,
              poiSourceId: waypoint.poiSourceId,
              poiSource: waypoint.poiSource,
              address: waypoint.address,
            }))
          }
        },
        include: {
          waypoints: {
            orderBy: { sequence: 'asc' }
          }
        }
      });

      this.logger.log(`Adventure created: ${adventure.id}`);

      // 2. Google Places APIで中継地点の座標を取得・更新
      await this.updateWaypointCoordinates(adventure.id, adventure.waypoints, adventure.plannedDistanceMeters);

      // 3. ランダム目的地を追加
      const currentLocation = adventure.waypoints.find(w => w.waypointType === 'START');
      if (currentLocation) {
        await this.addRandomDestination(
          adventure.id,
          currentLocation,
          adventure.plannedDistanceMeters
        );
      }

      // 4. ルート計算
      await this.calculateRoutes(adventure.id);

      // 5. ステータスを進行中に更新
      await this.prisma.adventure.update({
        where: { id: adventure.id },
        data: { status: AdventureStatus.IN_PROGRESS }
      });

      // 6. 完成したAdventureを取得して返却
      const completedAdventure = await this.findOne(adventure.id);

      this.logger.log(`Adventure processing completed successfully: ${adventure.id}`);
      return completedAdventure;

    } catch (error) {
      this.logger.error('Failed to create adventure:', error);

      // エラー時のステータス更新
      if (adventure?.id) {
        await this.prisma.adventure.update({
          where: { id: adventure.id },
          data: {
            status: AdventureStatus.FAILED,
            failureReason: error.message
          }
        }).catch((updateError) => {
          this.logger.error('Failed to update adventure status:', updateError);
        });
      }

      throw error;
    }
  }

  private async updateWaypointCoordinates(adventureId: string, waypoints: any[], maxDistance: number) {
    const startWaypoint = waypoints.find(w => w.waypointType === 'START');
    if (!startWaypoint) {
      this.logger.warn('No start waypoint found for coordinate updates');
      return;
    }

    // ユーザー指定距離を基準に検索範囲を決定（最小500m、最大5km）
    const searchRadius = Math.max(500, Math.min(maxDistance, 5000));

    for (const waypoint of waypoints) {
      // geolocationソースの場合はスキップ（既に座標がある）
      if (waypoint.poiSource === 'geolocation') continue;

      // POIの実際の座標を取得
      if (waypoint.poiCategory) {
        try {
          const coordinates = await this.googleMapsService.searchPOI(
            waypoint.poiCategory,
            { lat: startWaypoint.latitude, lng: startWaypoint.longitude },
            searchRadius // ユーザー指定距離を使用
          );

          if (coordinates) {
            await this.prisma.adventureWaypoint.update({
              where: { id: waypoint.id },
              data: {
                latitude: coordinates.lat,
                longitude: coordinates.lng,
                address: coordinates.address,
                locationName: coordinates.name
              }
            });

            this.logger.log(`Updated coordinates for waypoint ${waypoint.id}: ${coordinates.name}`);
          } else {
            this.logger.warn(`No coordinates found for waypoint ${waypoint.id} (${waypoint.poiCategory})`);
          }
        } catch (error) {
          this.logger.warn(`Failed to update coordinates for waypoint ${waypoint.id}:`, error);
        }
      }
    }
  }

  private async addRandomDestination(adventureId: string, startLocation: any, maxDistance: number) {
    const destinationCategories = [
      'tourist_attraction',
      'park',
      'place_of_worship',
      'museum',
      'amusement_park'
    ];

    // ランダムなカテゴリを選択
    const randomCategory = destinationCategories[Math.floor(Math.random() * destinationCategories.length)];

    try {
      const destination = await this.googleMapsService.searchRandomPOI(
        randomCategory,
        { lat: startLocation.latitude, lng: startLocation.longitude },
        maxDistance
      );

      if (destination) {
        // 既存のDESTINATIONをINTERMEDIATEに変更
        await this.prisma.adventureWaypoint.updateMany({
          where: {
            adventureId,
            waypointType: WaypointType.DESTINATION
          },
          data: { waypointType: WaypointType.INTERMEDIATE }
        });

        // 新しいDESTINATIONを追加
        const maxSequence = await this.prisma.adventureWaypoint.findFirst({
          where: { adventureId },
          orderBy: { sequence: 'desc' },
          select: { sequence: true }
        });

        const newWaypoint = await this.prisma.adventureWaypoint.create({
          data: {
            adventureId,
            sequence: (maxSequence?.sequence || 0) + 1,
            waypointType: WaypointType.DESTINATION,
            poiCategory: randomCategory,
            latitude: destination.lat,
            longitude: destination.lng,
            locationName: destination.name,
            address: destination.address,
            poiSource: 'google_places_random'
          }
        });

        // waypointCountを更新
        await this.prisma.adventure.update({
          where: { id: adventureId },
          data: {
            waypointCount: { increment: 1 }
          }
        });

        this.logger.log(`Random destination added: ${destination.name} (${randomCategory})`);
        return newWaypoint;
      } else {
        this.logger.warn(`No random destination found for category: ${randomCategory}`);
      }
    } catch (error) {
      this.logger.warn('Failed to add random destination:', error);
    }

    return null;
  }

  private async calculateRoutes(adventureId: string) {
    const waypoints = await this.prisma.adventureWaypoint.findMany({
      where: { adventureId },
      orderBy: { sequence: 'asc' }
    });

    if (waypoints.length < 2) {
      this.logger.warn('Not enough waypoints to calculate routes');
      return;
    }

    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];

      try {
        const routeData = await this.googleMapsService.calculateRoute(
          { lat: from.latitude, lng: from.longitude },
          { lat: to.latitude, lng: to.longitude },
          'walking'
        );

        if (routeData) {
          await this.prisma.route.create({
            data: {
              adventureId,
              fromWaypointId: from.id,
              toWaypointId: to.id,
              routeJson: routeData.routeJson,
              distanceMeters: routeData.distance,
              durationMinutes: routeData.duration,
              transportationMode: 'walking'
            }
          });

          totalDistance += routeData.distance;
          totalDuration += routeData.duration;

          this.logger.log(`Route calculated: ${from.locationName} → ${to.locationName} (${routeData.distance}m, ${routeData.duration}min)`);
        }
      } catch (error) {
        this.logger.warn(`Failed to calculate route from ${from.id} to ${to.id}:`, error);
      }
    }

    // 実際の総距離と時間をAdventureに記録
    await this.prisma.adventure.update({
      where: { id: adventureId },
      data: {
        // 実際の距離を別フィールドで保存する場合
        // actualDistanceMeters: totalDistance,
        // actualDurationMinutes: totalDuration
      }
    });

    this.logger.log(`Total route calculated: ${totalDistance}m, ${totalDuration}min`);
  }

  async findByUser(userId: string) {
    const adventures = await this.prisma.adventure.findMany({
      where: { userId },
      include: {
        waypoints: {
          orderBy: { sequence: 'asc' }
        },
        routes: {
          include: {
            fromWaypoint: true,
            toWaypoint: true
          },
          orderBy: { fromWaypoint: { sequence: 'asc' } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return adventures;
  }

  async findOne(id: string) {
    const adventure = await this.prisma.adventure.findUnique({
      where: { id },
      include: {
        waypoints: {
          orderBy: { sequence: 'asc' }
        },
        routes: {
          include: {
            fromWaypoint: true,
            toWaypoint: true
          },
          orderBy: { fromWaypoint: { sequence: 'asc' } }
        }
      }
    });

    if (!adventure) {
      throw new NotFoundException(`Adventure with ID ${id} not found`);
    }

    return adventure;
  }

  async remove(id: string) {
    // まずAdventureが存在するか確認
    const adventure = await this.prisma.adventure.findUnique({
      where: { id },
      select: { id: true, userId: true }
    });

    if (!adventure) {
      throw new NotFoundException(`Adventure with ID ${id} not found`);
    }

    try {
      // Prismaのカスケード削除を利用してAdventureを削除
      // 関連するwaypoints、routesも自動的に削除される
      await this.prisma.adventure.delete({
        where: { id }
      });

      this.logger.log(`Adventure ${id} deleted successfully`);

      return {
        message: 'Adventure deleted successfully',
        deletedAdventureId: id
      };
    } catch (error) {
      this.logger.error(`Failed to delete adventure ${id}:`, error);
      throw error;
    }
  }

  // Adventure状態を更新
  async updateStatus(id: string, status: AdventureStatus, failureReason?: string) {
    const updateData: any = { status };
    if (failureReason) {
      updateData.failureReason = failureReason;
    }

    const adventure = await this.prisma.adventure.update({
      where: { id },
      data: updateData,
      include: {
        waypoints: {
          orderBy: { sequence: 'asc' }
        }
      }
    });

    this.logger.log(`Adventure ${id} status updated to ${status}`);
    return adventure;
  }

  // 統計情報を取得
  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const stats = await this.prisma.adventure.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true
      }
    });

    const totalDistance = await this.prisma.adventure.aggregate({
      where,
      _sum: {
        plannedDistanceMeters: true
      }
    });

    return {
      statusCounts: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      }, {}),
      totalPlannedDistance: totalDistance._sum.plannedDistanceMeters || 0
    };
  }
}
