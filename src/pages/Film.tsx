const videos = [
  { id: 'mOTQ2pKFzRI', title: 'Video 1' },
  { id: 'wBiUj8QM2_k', title: 'Video 2' },
  { id: 'SODlyagyUl8', title: 'Video 3' },
]

export default function Film() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold text-stone-800 mb-2">Film</h1>
      <p className="text-stone-500 mb-12">Filmer vi lagt upp online — allt från hundar till annat kul.</p>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map(v => (
          <div key={v.id} className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm">
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${v.id}`}
                title={v.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
