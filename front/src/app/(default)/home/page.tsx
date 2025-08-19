"use client"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { POICombobox } from "@/components/ui/POICombobox"
import { poiOptions } from "@/lib/poiOptions"
import { RouteDisplay } from "@/components/RouteDisplay"
import { CreateAdventureDto,CreateWaypointDto,AdventureStatus,WaypointType} from "@/types/adventure"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"



export default function Page() {
  const {data: session, status} = useSession()
  const router = useRouter()
  const [isLoading,setIsLoading] = useState(false)
  const [currentLocation,setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [isLocationLoading,setIsLocationLoading] = useState(false)
  const [locationError,setLocationError] = useState<string>("")
  const [value, setValue] = useState<number[]>([1000])
  const [poiList, setPoiList] = useState<string[]>([])
  const [currentPOI, setCurrentPOI] = useState<string>("")
  const scrollTargetRef = useRef<HTMLDivElement>(null)

  //認証のチェック
  useEffect(() => {
    if (status === "loading") return

    if (status === "unauthenticated"){
      router.push("/auth/signin")
      return
    }
  },[status,router])


//poi追加
  const handleAddPOI = () => {
    if (!currentPOI) return
    setPoiList([...poiList, currentPOI])
    setCurrentPOI("")
  }

//poi削除
  const handleRemovePOI = (index: number) => {
    setPoiList(poiList.filter((_, i) => i !== index))
  }

  useEffect(() => {
    scrollTargetRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [poiList])

  //現在地取得

  const getCurrentLocation = async () => {
    if (!navigator.geolocation){
      setLocationError("このブラウザでは位置情報がサポートされていません")
      return
    }

    setIsLocationLoading(true)
    setLocationError("")

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude} = position.coords
        setCurrentLocation({lat: latitude,lng:longitude})
        setIsLocationLoading(false)
        console.log("現在地取得成功:",{lat: latitude, lng: longitude})
      },
      (error) => {
        setIsLocationLoading (false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("位置情報の使用が拒否されました。")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("位置情報を取得できませんでした。")
          case error.TIMEOUT:
            setLocationError("位置情報の取得がタイムアウトしました。")
            break
          default:
            setLocationError("位置情報の取得に失敗しました。")
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  //componentマウント時に現在地を取得
  useEffect(() => {
    getCurrentLocation()
  },[])

  //prisma schemaに沿ったデータに変換
  const convertToAdventureData = (): CreateAdventureDto => {
    const waypoints: CreateWaypointDto[] = []

    //現在地をスタート地点として追加
    if(currentLocation){
      waypoints.push({
        sequence: 0,
        waypointType: WaypointType.START,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        locationName:"現在地",
        poiSource:"geolocation"
      })
    }

    //poiリストを中継地点として追加
    poiList.forEach((poi,index) => {
      const sequence = currentLocation ? index + 1 : index
      const isLast = index === poiList.length - 1

      waypoints.push({
        sequence: sequence,
        waypointType: isLast ? WaypointType.DESTINATION : WaypointType.INTERMEDIATE,
        poiCategory: poi,
        latitude: 0,  //後からAPIで取得
        longitude: 0, //後からAPIで取得
        locationName: poiOptions.find(opt => opt.value === poi)?.label || poi,
        poiSourceId: `poi-${poi}-${Date.now()}`,
        poiSource: 'user-selection'
      })
    })

    return{
      userId: session?.user?.id || "", //sessionからユーザーIDを取得
      status: AdventureStatus.PLANNED,
      plannedDistanceMeters: value[0],
      waypointCount: waypoints.length,
      waypoints
    }
  }

  //生成ボタンのクリック処理
  const handleGenerate = async () => {
    if(!session?.user?.id){
      alert("ユーザー情報が取得できません。再度ログインしてください。")
      router.push("/auth/signin")
      return
    }

    if (poiList.length === 0){
      alert("少なくとも１つのスポットを選択してください。")
      return
    }

    if(!currentLocation){
      alert("現在地情報が取得できていません。位置情報を再取得してください")
      return
    }

    setIsLoading(true)

    try{
      const adventureData = convertToAdventureData()

      console.log("送信データ:", JSON.stringify(adventureData, null,2))

      //API呼び出し
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/adventures`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adventureData),
      })

      if (response.ok){
        const result = await response.json();
        console.log("Adventure created:", result)
        alert("ルートが正常に作成されました!MAPページに移動します。")
        router.push(`/routes/${result.id}`)
      }else{
        const error = await response.json()
        console.error('API Error:', error)
        alert('エラーが発生しました: ' + (error.message || response.statusText))
      }
    }catch{
      console.error('Network Error:',)
      alert('通信エラーが発生しました')
    }finally{
      setIsLoading(false)
    }
  }

  useEffect(() => {
    scrollTargetRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [poiList])

  // 認証情報の読み込み中は何も表示しない
  if (status === "loading") {
    return (
      <div className="max-w-md mx-[20px] my-4 bg-[#EACC66] p-8 rounded-lg text-center shadow-md text-white">
        <p>読み込み中...</p>
      </div>
    )
  }

  // 未認証の場合は何も表示しない（useEffectでリダイレクトされる）
  if (status === "unauthenticated") {
    return null
  }

  return (
    <form>
    <div className="max-w-md mx-[20px] my-4 bg-[#EACC66] p-8 rounded-lg text-center shadow-md text-white">
      <div className="flex justify-center mb-7">
        現在地からの距離、スポットの順番・種別を決めよう！
      </div>

      {/* ユーザー情報表示 */}
      {session?.user && (
        <div className="mb-4 p-2 bg-white/10 rounded text-sm">
          ログイン中: {session.user.email}
        </div>
      )}

      <p className="text-center mb-3 text-2xl">距離(M)</p>
      <Slider
        value={value}
        onValueChange={setValue}
        max={5000}
        step={100}
        aria-label="距離スライダー"
      />
      <p className="text-center mt-4">選択中: {value[0]}M</p>

      {/* 現在地情報表示 */}
      <div className="mt-6 p-4 bg-white/20 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">現在地情報</h3>
        {isLocationLoading ? (
          <p className="text-sm">位置情報を取得中...</p>
        ) : currentLocation ? (
          <div className="text-sm">
            <p className="text-green-200">✓ 現在地を取得済み</p>
            <p className="text-xs mt-1">
              緯度: {currentLocation.lat.toFixed(6)},
              経度: {currentLocation.lng.toFixed(6)}
            </p>
          </div>
        ) : locationError ? (
          <div className="text-sm">
            <p className="text-red-200">✗ {locationError}</p>
            <Button
              type="button"
              onClick={getCurrentLocation}
              className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 h-8 px-3"
            >
              再取得
            </Button>
          </div>
        ) : (
          <div className="text-sm">
            <p className="text-yellow-200">位置情報が必要です</p>
            <Button
              type="button"
              onClick={getCurrentLocation}
              className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 h-8 px-3"
            >
              位置情報を取得
            </Button>
          </div>
        )}
      </div>

      <div className="mt-10 text-2xl mb-3">中継スポット選択</div>

      <div className="flex flex-col gap-3 max-h-[300px] py-4 overflow-y-auto">
        {poiList.map((poi, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white text-black rounded-lg px-4 py-2 shadow"
          >
            <span>
              {poiOptions.find(opt => opt.value === poi)?.label || poi}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemovePOI(index)}
              disabled={isLoading}
            >
              <X className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}

        <div className="flex gap-2 items-center" ref={scrollTargetRef}>
          <POICombobox value={currentPOI} onChange={setCurrentPOI} />
          <Button
            onClick={handleAddPOI}
            type="button"
            disabled={!currentPOI || isLoading}
          >
            +
          </Button>
        </div>
      </div>

      {/*チェックポイント表示 */}
      <RouteDisplay poiList={poiList} />

      <div className="flex justify-center items-center">
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={poiList.length === 0 || isLoading || !currentLocation || !session?.user?.id}
          className="bg-green-400 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed mt-9 mb-7 w-40 h-40 text-4xl rounded-full flex items-center justify-center"
        >
          {isLoading ? "処理中..." : "生成"}
        </Button>
      </div>

      {/* 生成ボタンの説明 */}
      {((!currentLocation || poiList.length === 0) || !session?.user?.id) && (
        <div className="text-center text-sm text-red-500 -mt-4 mb-4">
          {!session?.user?.id && "認証情報、"}
          {!currentLocation && "現在地情報、"}
          {poiList.length === 0 && "スポット選択が1つ以上"}
          必要です
        </div>
      )}
    </div>
  </form>
  )
}
