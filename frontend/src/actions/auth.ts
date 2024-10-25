"use server"
import { clientConfig, serverConfig } from "@/lib/config";
import { AccountInformationType, AddressDetails } from "@/types/types";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { addAddress } from "./firebase";

export const getAuthToken = async () => await getTokens(cookies(), {
  apiKey: clientConfig.apiKey,
  cookieName: serverConfig.cookieName,
  cookieSignatureKeys: serverConfig.cookieSignatureKeys,
  serviceAccount: serverConfig.serviceAccount,
})

export async function getAddressDetails(data: AccountInformationType["addresses"][number]): Promise<AddressDetails | null> {
  try {
    const response = await fetch(`https://lookup.search.hereapi.com/v1/lookup?id=${data.id}&apiKey=${process.env.HERE_API_KEY}`);
    if (response.ok) {
      const { address, title } = await response.json();
      return {
        ...data,
        street: address.street || '',
        houseNumber: address.houseNumber || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.countryName || '',
        fullAddress: title
      };
    } else {
      throw new Error('Risposta non valida dal server HERE');
    }
  } catch (error) {
    console.error('Errore nel recupero dei dettagli dell\'indirizzo:', error);
    return null;
  }
}

export const getAddressSuggestions = async (text: string) => {
  const response = await fetch(`https://autocomplete.search.hereapi.com/v1/autocomplete?q=${encodeURIComponent(text)}&apiKey=${process.env.HERE_API_KEY}`);
  const data = await response.json()
  return data.items
}

export const getSuggestedAddress = async (id: string) => {
  const response = await fetch(`https://lookup.search.hereapi.com/v1/lookup?id=${id}&apiKey=${process.env.HERE_API_KEY}`);
  const data = await response.json();
  return data.address
}

const getPostalCode = async (query) => {
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

const validateAddress = async (street, houseNumber, city, postalCode, province, country) => {
  const query = `${houseNumber || ''} ${street}, ${city}, ${province}, ${postalCode}, ${country}`;
  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(query)}&apiKey=${process.env.HERE_API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // L'API ha trovato almeno un risultato per l'indirizzo
      return {
        isValid: true,
        data: data.items[0]
      };
    } else {
      // Nessun risultato trovato
      return {
        isValid: false,
        error: 'Indirizzo non trovato'
      };
    }
  } catch (error) {
    console.error('Errore durante la validazione dell\'indirizzo:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
};

export const checkAndAddAddress = async (address: {}) => {
  const auth = (await getAuthToken())?.decodedToken
  if (!auth)
    throw new Error("Non sei autenticato")

  const caps = await getPostalCode(address.postalCode)
  console.log("cap", caps, address)
  if (!caps || caps.length === 0)
    throw new Error("Controlla che il CAP è corretto; se lo è, ci spiace ma non consegnamo nel cap che hai inserito")
  address.city = address.city.trim().toUpperCase()
  if (!caps.map(cap => cap.zipcode === address.postalCode.toString() ? cap.city : "").find(city => city.toUpperCase().trim() === address.city))
    throw new Error("Il CAP non coincide con la città che hai inserito")
  const check = await validateAddress(address.street, address.houseNumber, address.city, address.postalCode, address.province, address.country)
  console.log(check)
  if (!check.isValid || check.error || !check.data.id)
    throw new Error("Non è stato possibile verificare che il tuo indirizzo sia esistente.")
  if (check.data.houseNumberFallback || check.data.address.houseNumber !== address.houseNumber)
    throw new Error("Il numero civico sembra non esistere.")
  await addAddress(auth.uid, check.data.id, address.other)
}

export const getAddressesFromAddressesLight = async (userId: string, addressesLight?: AccountInformationType["addresses"]) => {
  if (addressesLight && addressesLight.length > 5) {
      const deletePromises = addressesLight.slice(5).map(a => deleteAddress(userId, a.key));
      await Promise.all(deletePromises);
      addressesLight = addressesLight.slice(0, 5);
  }
  return (await Promise.all(addressesLight?.map(address => getAddressDetails(address)) || [])).filter(a => a !== null) as AddressDetails[];
}