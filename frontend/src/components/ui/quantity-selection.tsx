"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, ListPlus, Minus, Plus, Trash2 } from "lucide-react"
import { Dialog, DialogFooter, DialogHeader } from "./dialog"
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const QuantitySelection = ({ handleQuantity, quantity, disabled = false, removeEnable = false, dialogTitle = "", dialogDescription = "", handleAddToWishList = () => { }, containerRef = null }: { handleQuantity: (q: number) => void, quantity: number, disabled?: boolean, removeEnable?: boolean, dialogTitle?: string, dialogDescription?: string, handleAddToWishList?: () => void, containerRef?: Element | null }) => {
    return (
        <div className="mb-4">
            <div className="text-[0.70rem] text-muted-foreground">
                Quantità
            </div>
            <div className="flex items-center justify-center space-x-3 mt-[7px]">
                {removeEnable && quantity <= 1 ? <>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant={"destructive"}
                                size={"icon"}
                                className={"h-8 w-8 shrink-0 rounded-full dark:text-white"}
                                disabled={disabled}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent container={document.body} className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{dialogTitle}</DialogTitle>
                                <DialogDescription>{dialogDescription}</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary" className="mt-2 sm:mt-0">Annulla</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button variant="default" className="mt-2 sm:mt-0" onClick={handleAddToWishList}><Heart className="mr-1" strokeWidth={0} fill="red" /> Aggiungi</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button variant="destructive" onClick={() => handleQuantity(-1)}><Trash2 className="mr-1" /> Elimina</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog></>
                    : <Button
                        variant={removeEnable && quantity <= 1 ? "destructive" : "outline"}
                        size={"icon"}
                        className={"h-8 w-8 shrink-0 rounded-full dark:text-white"}
                        onClick={() => handleQuantity(-1)}
                        disabled={(!removeEnable && quantity <= 1) || disabled}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                }
                <div className="text-center">
                    <div className="text-foreground text-xl font-bold tracking-tighter">
                        {quantity}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full dark:text-white"
                    onClick={() => handleQuantity(1)}
                    disabled={disabled}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

export default QuantitySelection