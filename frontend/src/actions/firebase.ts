import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, push, get, remove } from "firebase/database";
import { AccountInformationType, CartLiteType, CartType, OrderType } from "@/types/types";
import { clientConfig } from "@/lib/config";
import { createUserWithEmailAndPassword, EmailAuthProvider, FacebookAuthProvider, getAuth, GoogleAuthProvider, isSignInWithEmailLink, OAuthProvider, sendPasswordResetEmail, sendSignInLinkToEmail, signInWithEmailAndPassword, signInWithEmailLink, signInWithPopup, signInWithRedirect, signOut, TwitterAuthProvider, updateProfile, User, UserCredential } from "firebase/auth";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";
import { Tokens } from "next-firebase-auth-edge";

// Initialize Firebase
const app = initializeApp(clientConfig);
//const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app)
auth.useDeviceLanguage()

export const createUserEmailAndPassowrd = async (email: string, password: string, userName: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateUserName(userName, credential)
    return credential
}
export const loginEmailAndPassword = async (email: string, password: string) => signInWithEmailAndPassword(auth, email, password)
export const loginWithFacebook = async () => await signInWithPopup(auth, new FacebookAuthProvider())
export const loginWithMicrosoft = async () => await signInWithPopup(auth, new OAuthProvider("microsoft.com"))
export const loginWithTwitter = async () => await signInWithPopup(auth, new TwitterAuthProvider())
export const logout = async () => await signOut(auth)
export const loginWithGoogle = async () => await signInWithPopup(auth, new GoogleAuthProvider())
export const sendSignupLinkViaEmail = async (email: string, targetPage: string, userName?: string, userId?: string) => {
    await sendSignInLinkToEmail(auth, email, { url: 'http://localhost:3000/signin-mail-link' + (userName ? "?username=" + userName : "") + (userId ? "&userId=" + userId : "") + (targetPage ? "&target=" + targetPage : ""), handleCodeInApp: true })
    // The link was successfully sent. Inform the user.
    // Save the email locally so you don't need to ask the user for it again
    // if they open the link on the same device.
    window.localStorage.setItem('emailForSignIn', email);
}
export const checkSignInEmailLink = async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
        // Additional state parameters can also be passed via URL.
        // This can be used to continue the user's intended action before triggering
        // the sign-in operation.
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            // User opened the link on a different device. To prevent session fixation
            // attacks, ask the user to provide the associated email again. For example:
            return false //window.prompt('Please provide your email for confirmation');
        }
        // The client SDK will parse the code from the link for you.
        const cred = await signInWithEmailLink(auth, email ?? "", window.location.href)
        // Clear email from storage.
        window.localStorage.removeItem('emailForSignIn');
        return cred
        // You can access the new user by importing getAdditionalUserInfo
        // and calling it with result:
        // getAdditionalUserInfo(result)
        // You can access the user's profile via:
        // getAdditionalUserInfo(result)?.profile
        // You can check if the user is new or existing:
        // getAdditionalUserInfo(result)?.isNewUser
    }
    return false
}
export const resetPassword = async (email: string) => await sendPasswordResetEmail(auth, email)
export const updateUserName = async (newName: string, user?: UserCredential) => {
    if (!user && !auth.currentUser)
        return
    await updateProfile(user || auth.currentUser, { displayName: newName })
    if (!auth.currentUser)
        return
    await auth.currentUser.reload()
    await fetch("/api/login", {
        headers: {
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
        }
    })
}

export const setDataRD = async (path: string, data: Object | string) => set(ref(db, path), data)
export const pushDataRD = async (path: string, data: Object | string) => push(ref(db, path), data)
export const getDataRD = async (path: string) => get(ref(db, path))
export const deleteDataRD = async (path: string) => remove(ref(db, path))

export const pushCartData = async (id: number, cart: CartLiteType) => {
    try {
        return (await pushDataRD("", { cart: { [id]: cart } })).key
    } catch (err) {
        return new Error("Impossibile salvare sul database il carrello: " + err)
    }
}

export const pushFavoritesData = async (variantId: number, productId: number) => {
    try {
        return (await pushDataRD("", { favorites: { [variantId]: productId } })).key
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

export const deleteCart = async (userId: string) => {
    try {
        return deleteDataRD(userId + "/cart")
    } catch (err) {
        return new Error("Impossibile eliminare il carrello dal database: " + err)
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

export const transferDataFromCookieToUserId = async (cookieId: string, userId?: string) => {
    if (!userId)
        userId = auth.currentUser?.uid
    const data = await getDataRD(cookieId)
    if (!data.exists())
        return
    await setDataRD(userId, data.val())
    await deleteDataRD(cookieId)
}

export const deleteDataFromId = async (id: string) => id ? await deleteDataRD(id) : null

export const getOrders = async (userId: string) => {
    try {
        let arr: OrderType[] = []
        const res = await getDataRD(userId + "/orders")
        res.forEach(i => { arr.push({ ...i.val(), orderId: i.key }) })
        return arr
    } catch (err) {
        return []
    }
}

export const getOrder = async (userId: string, orderId: string) => {
    try {
        const res = await getDataRD(userId + "/orders/" + orderId)
        if (!res.exists)
            throw "Err"
        return { orderId, ...res.val() } as OrderType
    } catch (err) {
        return null
    }
}

export const createOrder = async (userId: string, order: OrderType) => await pushDataRD(userId + "/orders", order)

export const getAccountInformation = async (userId: string) => {
    try {
        const info = await getDataRD(userId + "/info");
        let addresses: AccountInformationType["addresses"] = []
        info.child("addressIds").forEach(i => { addresses.push({ key: i.key, id: i.child("id").val() as string, details: i.child("details").exists() ? (i.child("details").val() as string) : undefined }) })
        addresses = addresses.reverse()
        return { ...info.val(), addresses } as AccountInformationType
    } catch (err) {
        return null
    }
}

export const getAddresses = async (userId: string) => {
    try {
        const res = await getDataRD(userId + "/info/addressIds");
        let addresses: AccountInformationType["addresses"] = []
        res.forEach(i => { addresses.push({ key: i.key, id: i.child("id").val() as string, details: i.child("details").exists() ? (i.child("details").val() as string) : undefined }) })
        addresses = addresses.reverse()
        return addresses as AccountInformationType["addresses"]
    } catch (err) {
        return null
    }
}

export const addAddress = async (userId: string, addressId: string, otherInfo?: string) => {
    try {
        await pushDataRD(userId + "/info/addressIds", { id: addressId, ...(otherInfo ? { details: otherInfo } : {}) })
    } catch (err) {
        console.log(err)
    }
}

export const deleteAddress = async (userId: string, addressKey: string) => {
    try {
        await deleteDataRD(userId + "/info/addressIds/" + addressKey)
    } catch (err) {
        console.log(err)
    }
}