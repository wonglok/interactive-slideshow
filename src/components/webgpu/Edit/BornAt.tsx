import copy from 'copy-to-clipboard'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { useApp, useStoreOfApp } from '../CanvasEditor/AppContext'
import {
    Baby,
    CrosshairIcon,
    MapPinHouseIcon,
    MenuSquareIcon,
    SquareArrowRight,
    StampIcon,
    Tv2Icon,
    TvIcon,
} from 'lucide-react'

export function BornAt() {
    let playerStart = useApp((r) => r.playerStart)
    let cameraStart = useApp((r) => r.cameraStart)
    let playerRotY = useApp((r) => r.playerRotY)
    let avatarTempLocation = useApp((r) => r.avatarTempLocation)
    let cameraTempLocation = useApp((r) => r.cameraTempLocation)
    let avatarTempRotY = useApp((r) => r.avatarTempRotY)
    let useMyStore = useStoreOfApp()
    return (
        <div className='rounded-2xl border bg-[#ffffff] p-3'>
            <div className='text-sm mb-1'>Player Position: </div>
            <div className='w-full flex justify-between'>
                <Input
                    type='text'
                    className=' inline-block w-[30%]'
                    value={playerStart[0].toFixed(2)}
                    onFocus={(ev: any) => {
                        ev.target.select()
                    }}
                    onClick={(ev: any) => {
                        ev.target.select()
                    }}
                    onChange={async (ev) => {
                        playerStart[0] = isNaN(Number(ev.target.value)) ? 0 : Number(ev.target.value)
                    }}
                ></Input>
                <Input
                    type='text'
                    className=' inline-block w-[30%]'
                    onFocus={(ev: any) => {
                        ev.target.select()
                    }}
                    onClick={(ev: any) => {
                        ev.target.select()
                    }}
                    value={playerStart[1].toFixed(2)}
                    onChange={async (ev) => {
                        playerStart[1] = isNaN(Number(ev.target.value)) ? 0 : Number(ev.target.value)
                    }}
                ></Input>
                <Input
                    type='text'
                    className=' inline-block w-[30%]'
                    onFocus={(ev: any) => {
                        ev.target.select()
                    }}
                    onClick={(ev: any) => {
                        ev.target.select()
                    }}
                    value={playerStart[2].toFixed(2)}
                    onChange={async (ev) => {
                        playerStart[2] = isNaN(Number(ev.target.value)) ? 0 : Number(ev.target.value)
                    }}
                ></Input>
            </div>

            <div className='text-sm mb-1'>Camera Position: </div>
            <div className='w-full flex justify-between mb-2'>
                <Input
                    type='text'
                    className=' inline-block w-[30%]'
                    value={cameraStart[0].toFixed(2)}
                    onFocus={(ev: any) => {
                        ev.target.select()
                    }}
                    onClick={(ev: any) => {
                        ev.target.select()
                    }}
                    onChange={async (ev) => {
                        cameraStart[0] = isNaN(Number(ev.target.value)) ? 0 : Number(ev.target.value)
                    }}
                ></Input>
                <Input
                    type='text'
                    className=' inline-block w-[30%]'
                    onFocus={(ev: any) => {
                        ev.target.select()
                    }}
                    onClick={(ev: any) => {
                        ev.target.select()
                    }}
                    value={cameraStart[1].toFixed(2)}
                    onChange={async (ev) => {
                        cameraStart[1] = isNaN(Number(ev.target.value)) ? 0 : Number(ev.target.value)
                    }}
                ></Input>
                <Input
                    type='text'
                    className=' inline-block w-[30%]'
                    onFocus={(ev: any) => {
                        ev.target.select()
                    }}
                    onClick={(ev: any) => {
                        ev.target.select()
                    }}
                    value={cameraStart[2].toFixed(2)}
                    onChange={async (ev) => {
                        cameraStart[2] = isNaN(Number(ev.target.value)) ? 0 : Number(ev.target.value)
                    }}
                ></Input>
            </div>

            <div className='text-sm mb-1'>Player Y Rotation: </div>
            <div className='w-full mb-2'>
                <Input
                    type='text'
                    className=' inline-block w-[30%]'
                    value={playerRotY.toFixed(2)}
                    onFocus={(ev: any) => {
                        ev.target.select()
                    }}
                    onClick={(ev: any) => {
                        ev.target.select()
                    }}
                    onChange={async (ev) => {
                        let playerRotY = isNaN(Number(ev.target.value)) ? 0 : Number(ev.target.value)

                        useMyStore.setState({
                            playerRotY: playerRotY,
                        })
                    }}
                ></Input>
            </div>
            <div>
                <Button
                    className='w-full b'
                    variant={'outline'}
                    onClick={async () => {
                        //
                        useMyStore.setState({
                            playerRotY: avatarTempRotY,
                            playerStart: [...avatarTempLocation],
                            cameraStart: [...cameraTempLocation],
                        })

                        copy(
                            JSON.stringify(
                                {
                                    playerRotY: Number(Number(avatarTempRotY).toFixed(5)),
                                    playerStart: [...avatarTempLocation].map((r) => Number(r.toFixed(3))),
                                    cameraStart: [...cameraTempLocation].map((r) => Number(r.toFixed(3))),
                                },
                                null,
                                '  ',
                            ),
                        )

                        console.log(
                            JSON.stringify({
                                playerRotY: avatarTempRotY,
                                playerStart: [...avatarTempLocation],
                                cameraStart: [...cameraTempLocation],
                            }),
                        )
                        //
                    }}
                >
                    Set View as Start Screen <MapPinHouseIcon></MapPinHouseIcon>
                </Button>
            </div>
        </div>
    )
}
