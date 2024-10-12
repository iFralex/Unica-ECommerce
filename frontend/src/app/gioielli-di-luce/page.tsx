import Image from 'next/image';

const Page = async ({}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <section className="bg-purple-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-purple-800 mb-6">Gioielli di Luce</h2>
          <p className="text-xl text-gray-700 mb-8">Illumina la vita degli altri con la tua unicità</p>
          <a href="#" className="bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition duration-300">Scopri la Collezione</a>
        </div>
      </section>

      <section id="progetto" className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-purple-800 mb-12">Il Nostro Progetto</h3>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <Image src="/api/placeholder/500/300" alt="Immagine del progetto" width={500} height={300} className="rounded-lg shadow-lg" />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <p className="text-gray-700 text-lg mb-6">
                "Gioielli di Luce" è un progetto di marketing benefico che unisce la bellezza dei gioielli Unica al nobile scopo di sostenere una fondazione che dona cani guida per disabili visivi. Ogni gioiello acquistato non solo rappresenta l'unicità di chi lo indossa, ma contribuisce anche a illuminare la vita di chi ne ha più bisogno.
              </p>
              <p className="text-gray-700 text-lg">
                Con il tuo acquisto, non solo ottieni un pezzo unico che ti rappresenta, ma diventi parte di una catena di solidarietà che trasforma vite.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="prodotti" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-purple-800 mb-12">I Nostri Gioielli</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-100 rounded-lg overflow-hidden shadow-md">
                <Image src={`/api/placeholder/400/300`} alt={`Gioiello ${item}`} width={400} height={300} className="w-full" />
                <div className="p-6">
                  <h4 className="text-xl font-semibold text-purple-700 mb-2">Gioiello Unico {item}</h4>
                  <p className="text-gray-600 mb-4">Una descrizione breve del gioiello e del suo significato unico.</p>
                  <a href="#" className="text-purple-600 font-semibold hover:text-purple-800">Scopri di più</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="impatto" className="bg-purple-50 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-purple-800 mb-12">Il Nostro Impatto</h3>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12">
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600 mb-2">100+</p>
              <p className="text-gray-700">Cani guida donati</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600 mb-2">1000+</p>
              <p className="text-gray-700">Clienti soddisfatti</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600 mb-2">€50,000+</p>
              <p className="text-gray-700">Fondi raccolti</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <blockquote className="text-center">
            <p className="text-2xl italic text-gray-700 mb-4">"Grazie a Gioielli di Luce, non solo ho un bellissimo bracciale, ma so che ho contribuito a cambiare la vita di qualcuno. È un'esperienza di acquisto incredibilmente gratificante."</p>
          </blockquote>
        </div>
      </section>
    </div>
  )
}

export default Page;