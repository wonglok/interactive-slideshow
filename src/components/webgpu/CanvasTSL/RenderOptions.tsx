import { useMemo } from 'react'
import { getRenderOptionsData, useApp, useStoreOfApp } from '../CanvasEditor/AppContext'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '../ui/dropdown'
import { Button } from '../../ui/button'
import { CameraIcon, ScanEyeIcon, ScanHeartIcon, ScanIcon, ScanLine, Sparkle, Sparkles } from 'lucide-react'

//

export function RenderOptions() {
    let opts = useMemo(() => {
        return getRenderOptionsData()
    }, [])

    let useStore = useStoreOfApp()
    let render = useApp((r) => r.render)

    let opt = opts.find((r) => r.value === render)
    let idx = opts.findIndex((r) => r.value === render)
    return (
        <>
            {/*  */}
            <div className='py-2 px-2 flex items-center mb-1 rounded-full bg-white'>
                <Sparkles className='mr-2 ml-1' />
                <input
                    type='range'
                    className='w-full mr-2'
                    value={idx}
                    onChange={(event: any) => {
                        //

                        let opt = opts[event.target.value] as any

                        useStore.setState({
                            render: opt.value,
                        })

                        //
                    }}
                    min={0}
                    max={opts.length - 1}
                    step={1}
                ></input>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant='outline' className='w-full'>
                        <Sparkles /> {opt?.displayName}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='start'>
                    <DropdownMenuLabel className='text-xs text-gray-500'>Render</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {opts
                            .filter((r) => r.type === 'render')
                            .map((it) => {
                                return (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            //
                                            useStore.setState({
                                                render: it.value,
                                            })
                                            //
                                        }}
                                        key={it.value}
                                    >
                                        <span className='text-sm'>{it.displayName}</span>
                                        <DropdownMenuShortcut className='text-[10px]'>{it.value}</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                )
                            })}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className='text-xs text-gray-500'>Debug</DropdownMenuLabel>
                        {opts
                            .filter((r) => r.type === 'debug')
                            .map((it) => {
                                return (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            //
                                            useStore.setState({
                                                render: it.value,
                                            })
                                            //
                                        }}
                                        key={it.value}
                                    >
                                        <span className='text-sm'>{it.displayName}</span>
                                        <DropdownMenuShortcut className='text-[10px]'>{it.value}</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                )
                            })}
                    </DropdownMenuGroup>

                    {/*                     
                    <DropdownMenuGroup>
                        <DropdownMenuItem>Debug</DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem>Email</DropdownMenuItem>
                                    <DropdownMenuItem>Message</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>More...</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuItem>
                            New Team
                            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>GitHub</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuItem disabled>API</DropdownMenuItem>
                    <DropdownMenuSeparator /> */}
                    {/* <DropdownMenuItem>
                            Billing
                            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Keyboard shortcuts
                            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                        </DropdownMenuItem> */}
                    {/* <DropdownMenuItem>
                        Log out
                        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>

            {/*  */}
        </>
    )
}
