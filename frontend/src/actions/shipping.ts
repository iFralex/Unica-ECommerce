"use server"

import { AddressDetails } from "@/types/types";

interface Package {
    weight: number;
    length: number;
    width: number;
    height: number;
}

interface ShippingService {
    id: string;
    name: string;
    price: number;
    departureCountry: string;
    destinationCountry: string;
    national: boolean;
    destinationDropOff: boolean;
}

const transformPostalCode = (countryCode: string, postalCode: string): string => {
    const postalFormats: Record<string, string[]> = {
        GB: ['** ***', '*** ***', '**** ***'],
        IM: ['** ***', '*** ***', '**** ***'],
        JE: ['** ***', '*** ***', '**** ***'],
        GG: ['** ***', '*** ***', '**** ***'],
        NL: ['**** **', '****'],
        PT: ['****-***', '****'],
        US: ['*****-****', '*****']
    };

    if (!postalFormats[countryCode]) return postalCode;
    if (countryCode === 'US') return postalCode.slice(0, 5);

    const cleanPostal = postalCode.replace(/[^a-zA-Z0-9]/g, '');
    const format = postalFormats[countryCode].find(f =>
        (postalCode.match(/[a-zA-Z0-9]/g) || []).length === f.split('*').length - 1
    );

    if (!format) return postalCode;

    return format.split('').reduce((acc, char, i) =>
        char === '*' ? acc + cleanPostal[acc.length] : acc + char
        , '');
};

export const getCarriers = async (
    fromCountry: string,
    fromZip: string,
    toCountry: string,
    toZip: string,
    packages: Package[]
): Promise<ShippingService[]> => {
    try {
        const transformedZip = transformPostalCode(toCountry, toZip);
        const params = new URLSearchParams({
            'from[country]': fromCountry,
            'from[zip]': fromZip,
            "to[country]": toCountry,
            "to[zip]": transformedZip,
            ...packages.reduce((result, packageObj, i) => {
                Object.keys(packageObj).forEach((key) => {
                    result[`packages[${i}][${key}]`] = packageObj[key];
                });
                return result;
            }, {})
        });

        const response = await fetch(
            `https://api.packlink.com/v1/services?${params}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': process.env.PACKLINK_API_KEY || ""
                }
            }
        );

        if (!response.ok) {
            // Retry with original zip if transformed zip failed
            if (response.status === 400 &&
                transformedZip !== toZip &&
                await response.text() === 'Location not valid for the input data') {
                console.warn(`Request with transformed postal code ${transformedZip} for ${toCountry} failed`);
                params.set('to_zip', toZip);
                const retryResponse = await fetch(
                    `https://api.packlink.com/v1/services?${params}`,
                    {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': process.env.PACKLINK_API_KEY || ""
                        }
                    }
                );

                if (!retryResponse.ok) throw new Error(`HTTP error! status: ${retryResponse.status}`);
                return await retryResponse.json();
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const services: ShippingService[] = await response.json();

        return services.map(service => ({
            ...service,
            logo: "https://cdn.packlink.com/apps/carrier-logos/" + service.logo_id + ".svg"
        }));
    } catch (error) {
        console.error('Error fetching shipping services:', error);
        return [];
    }
};

export const getPostalCode = async (query) => {
    const BASE_URL = 'https://api.packlink.com';
    const API_VERSION = 'v1';
    const COUNTRY = 'IT';

    const url = new URL(`${BASE_URL}/${API_VERSION}/locations/postalcodes/country/${COUNTRY}`);
    url.searchParams.append('q', query);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.PACKLINK_API_KEY || "",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching postal code:', error.message);
        return { error: error.message };
    }
};

export const createShipping = async (data) => {
    const result = await fetch("https://api.packlink.com/v1/shipments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': process.env.PACKLINK_API_KEY || ""
        },
        body: JSON.stringify(data),
    })
    return !result.ok ? false : result.json()
}

export const getDropOffPoints = async (shipmentService?: "Inpost IT" | "poste italiane", position?: AddressDetails["position"], name?: string) => {
    if (!shipmentService || !position)
        return
    switch (shipmentService) {
        case "Inpost IT":
            const r = await fetch('https://api-it-local-points.easypack24.net/v1/points?relative_point=' + position.lat + '%2C' + position.lng + '&sort_by=distance_to_relative_point&fields=name,distance,operating_hours_extended,opening_hours,location_type,address,address_details,location_description')
            const a = await r.json()
            return a.items
    }
}