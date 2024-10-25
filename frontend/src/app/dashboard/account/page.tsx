import React from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Edit, Trash, PlusCircle, PlusCircleIcon, Plus, Trash2, KeyRound } from 'lucide-react';

// Assumo che questa funzione esista nel tuo progetto
import { addAddress, deleteAddress, getAccountInformation } from '@/actions/firebase';
import { AccountAction, AddressForm, DeleteAddressButton, DeleteAddressLoadingDialog, LoadingDialog } from './account-client';
import { getAddressDetails, getAddressesFromAddressesLight, getAuthToken } from '@/actions/auth';
import { notFound } from 'next/navigation';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AccountInformationType, AddressDetails } from '@/types/types';
import { ContainerDashboard } from '@/components/dashboard';

const Page = async () => {
    const tokens = await getAuthToken();
    if (!tokens) notFound();

    const auth = tokens.decodedToken;
    const info = await getAccountInformation(auth.uid);

    const accountInfoItems = [
        { label: "Nome", text: auth.name ?? "", action: "update name" },
        { label: "Email", text: auth.email }
    ];
    const addresses = await getAddressesFromAddressesLight(auth.uid)

    return (
        <ContainerDashboard title="Account">
            <div className='w-full'>
                <Card className="w-full p-6 mb-6">
                    <CardTitle className="mb-4 text-2xl font-bold">
                        Informazioni d'accesso
                    </CardTitle>
                    {accountInfoItems.map((item, i, self) => (
                        <div key={i}>
                            <div className="flex flex-wrap items-center justify-between py-2">
                                <span className="font-medium">{item.label}:</span>
                                <span className="flex items-center">
                                    {item.text}
                                    {item.action && <AccountAction action={item.action} />}
                                </span>
                            </div>
                            {i < self.length - 1 && <Separator className="my-2" />}
                        </div>
                    ))}
                    <div className='w-full flex justify-center mt-2'>
                        <AccountAction action={"reset password"} tokens={tokens} />
                    </div>
                </Card>

                <Card className="w-full p-6 mb-6">
                    <CardTitle className="mb-4 text-2xl font-bold flex items-center">
                        I tuoi indirizzi
                    </CardTitle>
                    {addresses.length === 0 ? (
                        <p className="text-muted-foreground italic mb-3">Nessun indirizzo salvato</p>
                    ) : (
                        addresses.map((address, index, self) => (
                            <div key={address.key} className="mb-4 last:mb-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start">
                                        <MapPin className="mr-2 mt-1 text-blue-500" size={20} />
                                        <div>
                                            <p className="font-medium">{address.street} {address.houseNumber}</p>
                                            <p className="text-sm text-gray-600">
                                                {address.postalCode} {address.city}, {address.county}
                                            </p>
                                            <p className="text-sm text-gray-600">{address.country}</p>
                                            {address.details && <p className="text-sm">
                                                Altre info: <span className='text-muted-foreground'>{address.details}</span>
                                            </p>}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <DeleteAddressLoadingDialog userId={auth.uid} address={address} />
                                    </div>
                                </div>
                                {index < self.length - 1 && <Separator className="my-4" />}
                            </div>
                        ))
                    )}
                    <AddressForm />
                </Card>
            </div>
        </ContainerDashboard>
    );
};

export default Page;