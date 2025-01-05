const Page = async () => {

    let a = await fetch("http://localhost:3000/api", {
        method: "POST", cache: "no-store", headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify({query: "omicidio"})
    })

    if (a.status !== 200)
        return a.status
    let r = await a.json()
    console.log(r)
    return r.map(t => <p>{t[0].toString().substring(0, 4)}) {t[1]}</p>)
}

export default Page