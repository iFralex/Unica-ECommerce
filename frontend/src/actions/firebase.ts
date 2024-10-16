import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, push, get, remove } from "firebase/database";
import { CartLiteType, CartType } from "@/types/types";
import { clientConfig } from "@/lib/config";
import { createUserWithEmailAndPassword, FacebookAuthProvider, getAuth, GoogleAuthProvider, OAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, TwitterAuthProvider, updateProfile } from "firebase/auth";

// Initialize Firebase
const app = initializeApp(clientConfig);
//const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app)
auth.useDeviceLanguage()

export const createUserEmailAndPassowrd = async (email: string, password: string, userName: string) => {
    const crediential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(crediential.user, { displayName: userName })
    return crediential
}
export const loginEmailAndPassword = async (email: string, password: string) => signInWithEmailAndPassword(auth, email, password)
export const loginWithFacebook = async () => await signInWithPopup(auth, new FacebookAuthProvider())
export const loginWithMicrosoft = async () => await signInWithPopup(auth, new OAuthProvider("microsoft.com"))
export const loginWithTwitter = async () => await signInWithPopup(auth, new TwitterAuthProvider())
export const logout = async () => await signOut(auth)
export const loginWithGoogle = async () => await signInWithPopup(auth, new GoogleAuthProvider())
export const resetPassword = async (email: string) => await sendPasswordResetEmail(auth, email)

export const setDataRD = async (path: string, data: Object | string) => set(ref(db, path), data)
export const getDataRD = async (path: string) => get(ref(db, path))
export const deleteDataRD = async (path: string) => remove(ref(db, path))

export const pushCartData = async (id: number, cart: CartLiteType) => {
    try {
        return (await push(ref(db), { cart: { [id]: cart } })).key
    } catch (err) {
        return new Error("Impossibile salvare sul database il carrello: " + err)
    }
}

export const pushFavoritesData = async (variantId: number, productId: number) => {
    try {
        return (await push(ref(db), { favorites: { [variantId]: productId } })).key
    } catch (err) {
        return new Error("Impossibile salvare sul database il prodotto nei preferiti: " + err)
    }
}

export const setNewCartItem = async (userId: string, variantId: number, data: CartLiteType) => {
    try {
        return setDataRD(userId + "/cart/" + variantId, data)
    } catch (err) {
        return new Error("Impossibile salvare sul database il carrello: " + err)
    }
}

export const setNewFavoriteItem = async (userId: string, variantId: number, productId: number) => {
    try {
        return setDataRD(userId + "/favorites/" + variantId, productId)
    } catch (err) {
        return new Error("Impossibile salvare sul database il prodotto preferito: " + err)
    }
}

export const addToCartItem = async (userId: string, variantId: number, quantity: number) => {
    try {
        return setDataRD(userId + "/cart/" + variantId + "/quantity", quantity)
    } catch (err) {
        return new Error("Impossibile salvare sul database il carrello: " + err)
    }
}

export const deleteCartItem = async (userId: string, variantId: number) => {
    try {
        return deleteDataRD(userId + "/cart/" + variantId)
    } catch (err) {
        return new Error("Impossibile eliminare i dati sul database: " + err)
    }
}

export const deleteFavoriteItem = async (userId: string, variantId: number) => {
    try {
        return deleteDataRD(userId + "/favorites/" + variantId)
    } catch (err) {
        return new Error("Impossibile eliminare il prodotto preferito sul database: " + err)
    }
}

export const getCartsLight = async (userId: string) => {
    try {
        const data = await getDataRD(userId + "/cart")
        if (!data.exists())
            throw new Error("Non esiste")
        const arr: CartLiteType[] = []
        data.forEach(i => { arr.push(i.val()) })
        return arr
    } catch (err) {
        return new Error("Impossibile recuperare dati dal database il carrello: " + err)
    }
}

export const getCartLight = async (userId: string, variantId: number) => {
    try {
        const data = await getDataRD(userId + "/cart/" + variantId)
        if (!data.exists())
            throw new Error("Non esiste")
        return data
    } catch (err) {
        return new Error("Impossibile recuperare dati dal database il carrello: " + err)
    }
}

export const getFavoritesLight = async (userId: string) => {
    try {
        const data = await getDataRD(userId + "/favorites")
        if (!data.exists())
            throw new Error("Non esiste")
        const arr: { vId: number, pId: number }[] = []
        data.forEach(i => { arr.push({ vId: parseInt(i.key), pId: i.val() }) })
        return arr
    } catch (err) {
        return new Error("Impossibile recuperare dati dal database il carrello: " + err)
    }
}

export const transferDataFromCookieToUserId = async (cookieId: string, userId: string) => {
    const data = await getDataRD(cookieId)
    if (!data.exists())
        return
    await setDataRD(userId, data.val())
    await deleteDataRD(cookieId)
}

export const deleteDataFromId = async (id: string) => id ? await deleteDataRD(id) : null