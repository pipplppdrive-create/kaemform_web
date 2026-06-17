export type Wilayah514 = Record<string, string[]>;

const RAW_WILAYAH_514 = `
provinsi	Kabupaten/kota
Prov. Aceh	Kab. Aceh Barat
Prov. Aceh	Kab. Aceh Barat Daya
Prov. Aceh	Kab. Aceh Besar
Prov. Aceh	Kab. Aceh Jaya
Prov. Aceh	Kab. Aceh Selatan
Prov. Aceh	Kab. Aceh Singkil
Prov. Aceh	Kab. Aceh Tamiang
Prov. Aceh	Kab. Aceh Tengah
Prov. Aceh	Kab. Aceh Tenggara
Prov. Aceh	Kab. Aceh Timur
Prov. Aceh	Kab. Aceh Utara
Prov. Aceh	Kab. Bener Meriah
Prov. Aceh	Kab. Bireuen
Prov. Aceh	Kab. Gayo Lues
Prov. Aceh	Kab. Nagan Raya
Prov. Aceh	Kab. Pidie
Prov. Aceh	Kab. Pidie Jaya
Prov. Aceh	Kab. Simeulue
Prov. Aceh	Kota Banda Aceh
Prov. Aceh	Kota Langsa
Prov. Aceh	Kota Lhokseumawe
Prov. Aceh	Kota Sabang
Prov. Aceh	Kota Subulussalam
Prov. Bali	Kab. Badung
Prov. Bali	Kab. Bangli
Prov. Bali	Kab. Buleleng
Prov. Bali	Kab. Gianyar
Prov. Bali	Kab. Jembrana
Prov. Bali	Kab. Karang Asem
Prov. Bali	Kab. Klungkung
Prov. Bali	Kab. Tabanan
Prov. Bali	Kota Denpasar
Prov. Banten	Kab. Lebak
Prov. Banten	Kab. Pandeglang
Prov. Banten	Kab. Serang
Prov. Banten	Kab. Tangerang
Prov. Banten	Kota Cilegon
Prov. Banten	Kota Serang
Prov. Banten	Kota Tangerang
Prov. Banten	Kota Tangerang Selatan
Prov. Bengkulu	Kab. Bengkulu Selatan
Prov. Bengkulu	Kab. Bengkulu Tengah
Prov. Bengkulu	Kab. Bengkulu Utara
Prov. Bengkulu	Kab. Kaur
Prov. Bengkulu	Kab. Kepahiang
Prov. Bengkulu	Kab. Lebong
Prov. Bengkulu	Kab. Muko-muko
Prov. Bengkulu	Kab. Rejang Lebong
Prov. Bengkulu	Kab. Seluma
Prov. Bengkulu	Kota Bengkulu
Prov. D.I. Yogyakarta	Kab. Bantul
Prov. D.I. Yogyakarta	Kab. Gunung Kidul
Prov. D.I. Yogyakarta	Kab. Kulon Progo
Prov. D.I. Yogyakarta	Kab. Sleman
Prov. D.I. Yogyakarta	Kota Yogyakarta
Prov. D.K.I. Jakarta	Kab. Kepulauan Seribu
Prov. D.K.I. Jakarta	Kota Jakarta Barat
Prov. D.K.I. Jakarta	Kota Jakarta Pusat
Prov. D.K.I. Jakarta	Kota Jakarta Selatan
Prov. D.K.I. Jakarta	Kota Jakarta Timur
Prov. D.K.I. Jakarta	Kota Jakarta Utara
Prov. Gorontalo	Kab. Boalemo
Prov. Gorontalo	Kab. Bone Bolango
Prov. Gorontalo	Kab. Gorontalo
Prov. Gorontalo	Kab. Gorontalo Utara
Prov. Gorontalo	Kab. Pohuwato
Prov. Gorontalo	Kota Gorontalo
Prov. Jambi	Kab. Batang Hari
Prov. Jambi	Kab. Bungo
Prov. Jambi	Kab. Kerinci
Prov. Jambi	Kab. Merangin
Prov. Jambi	Kab. Muaro Jambi
Prov. Jambi	Kab. Sarolangun
Prov. Jambi	Kab. Tanjung Jabung Barat
Prov. Jambi	Kab. Tanjung Jabung Timur
Prov. Jambi	Kab. Tebo
Prov. Jambi	Kota Jambi
Prov. Jambi	Kota Sungai Penuh
Prov. Jawa Barat	Kab. Bandung
Prov. Jawa Barat	Kab. Bandung Barat
Prov. Jawa Barat	Kab. Bekasi
Prov. Jawa Barat	Kab. Bogor
Prov. Jawa Barat	Kab. Ciamis
Prov. Jawa Barat	Kab. Cianjur
Prov. Jawa Barat	Kab. Cirebon
Prov. Jawa Barat	Kab. Garut
Prov. Jawa Barat	Kab. Indramayu
Prov. Jawa Barat	Kab. Karawang
Prov. Jawa Barat	Kab. Kuningan
Prov. Jawa Barat	Kab. Majalengka
Prov. Jawa Barat	Kab. Pangandaran
Prov. Jawa Barat	Kab. Purwakarta
Prov. Jawa Barat	Kab. Subang
Prov. Jawa Barat	Kab. Sukabumi
Prov. Jawa Barat	Kab. Sumedang
Prov. Jawa Barat	Kab. Tasikmalaya
Prov. Jawa Barat	Kota Bandung
Prov. Jawa Barat	Kota Banjar
Prov. Jawa Barat	Kota Bekasi
Prov. Jawa Barat	Kota Bogor
Prov. Jawa Barat	Kota Cimahi
Prov. Jawa Barat	Kota Cirebon
Prov. Jawa Barat	Kota Depok
Prov. Jawa Barat	Kota Sukabumi
Prov. Jawa Barat	Kota Tasikmalaya
Prov. Jawa Tengah	Kab. Banjarnegara
Prov. Jawa Tengah	Kab. Banyumas
Prov. Jawa Tengah	Kab. Batang
Prov. Jawa Tengah	Kab. Blora
Prov. Jawa Tengah	Kab. Boyolali
Prov. Jawa Tengah	Kab. Brebes
Prov. Jawa Tengah	Kab. Cilacap
Prov. Jawa Tengah	Kab. Demak
Prov. Jawa Tengah	Kab. Grobogan
Prov. Jawa Tengah	Kab. Jepara
Prov. Jawa Tengah	Kab. Karanganyar
Prov. Jawa Tengah	Kab. Kebumen
Prov. Jawa Tengah	Kab. Kendal
Prov. Jawa Tengah	Kab. Klaten
Prov. Jawa Tengah	Kab. Kudus
Prov. Jawa Tengah	Kab. Magelang
Prov. Jawa Tengah	Kab. Pati
Prov. Jawa Tengah	Kab. Pekalongan
Prov. Jawa Tengah	Kab. Pemalang
Prov. Jawa Tengah	Kab. Purbalingga
Prov. Jawa Tengah	Kab. Purworejo
Prov. Jawa Tengah	Kab. Rembang
Prov. Jawa Tengah	Kab. Semarang
Prov. Jawa Tengah	Kab. Sragen
Prov. Jawa Tengah	Kab. Sukoharjo
Prov. Jawa Tengah	Kab. Tegal
Prov. Jawa Tengah	Kab. Temanggung
Prov. Jawa Tengah	Kab. Wonogiri
Prov. Jawa Tengah	Kab. Wonosobo
Prov. Jawa Tengah	Kota Magelang
Prov. Jawa Tengah	Kota Pekalongan
Prov. Jawa Tengah	Kota Salatiga
Prov. Jawa Tengah	Kota Semarang
Prov. Jawa Tengah	Kota Surakarta
Prov. Jawa Tengah	Kota Tegal
Prov. Jawa Timur	Kab. Bangkalan
Prov. Jawa Timur	Kab. Banyuwangi
Prov. Jawa Timur	Kab. Blitar
Prov. Jawa Timur	Kab. Bojonegoro
Prov. Jawa Timur	Kab. Bondowoso
Prov. Jawa Timur	Kab. Gresik
Prov. Jawa Timur	Kab. Jember
Prov. Jawa Timur	Kab. Jombang
Prov. Jawa Timur	Kab. Kediri
Prov. Jawa Timur	Kab. Lamongan
Prov. Jawa Timur	Kab. Lumajang
Prov. Jawa Timur	Kab. Madiun
Prov. Jawa Timur	Kab. Magetan
Prov. Jawa Timur	Kab. Malang
Prov. Jawa Timur	Kab. Mojokerto
Prov. Jawa Timur	Kab. Nganjuk
Prov. Jawa Timur	Kab. Ngawi
Prov. Jawa Timur	Kab. Pacitan
Prov. Jawa Timur	Kab. Pamekasan
Prov. Jawa Timur	Kab. Pasuruan
Prov. Jawa Timur	Kab. Ponorogo
Prov. Jawa Timur	Kab. Probolinggo
Prov. Jawa Timur	Kab. Sampang
Prov. Jawa Timur	Kab. Sidoarjo
Prov. Jawa Timur	Kab. Situbondo
Prov. Jawa Timur	Kab. Sumenep
Prov. Jawa Timur	Kab. Trenggalek
Prov. Jawa Timur	Kab. Tuban
Prov. Jawa Timur	Kab. Tulungagung
Prov. Jawa Timur	Kota Batu
Prov. Jawa Timur	Kota Blitar
Prov. Jawa Timur	Kota Kediri
Prov. Jawa Timur	Kota Madiun
Prov. Jawa Timur	Kota Malang
Prov. Jawa Timur	Kota Mojokerto
Prov. Jawa Timur	Kota Pasuruan
Prov. Jawa Timur	Kota Probolinggo
Prov. Jawa Timur	Kota Surabaya
Prov. Kalimantan Barat	Kab. Bengkayang
Prov. Kalimantan Barat	Kab. Kapuas Hulu
Prov. Kalimantan Barat	Kab. Kayong Utara
Prov. Kalimantan Barat	Kab. Ketapang
Prov. Kalimantan Barat	Kab. Kuburaya
Prov. Kalimantan Barat	Kab. Landak
Prov. Kalimantan Barat	Kab. Melawi
Prov. Kalimantan Barat	Kab. Mempawah
Prov. Kalimantan Barat	Kab. Sambas
Prov. Kalimantan Barat	Kab. Sanggau
Prov. Kalimantan Barat	Kab. Sekadau
Prov. Kalimantan Barat	Kab. Sintang
Prov. Kalimantan Barat	Kota Pontianak
Prov. Kalimantan Barat	Kota Singkawang
Prov. Kalimantan Selatan	Kab. Balangan
Prov. Kalimantan Selatan	Kab. Banjar
Prov. Kalimantan Selatan	Kab. Barito Kuala
Prov. Kalimantan Selatan	Kab. Hulu Sungai Selatan
Prov. Kalimantan Selatan	Kab. Hulu Sungai Tengah
Prov. Kalimantan Selatan	Kab. Hulu Sungai Utara
Prov. Kalimantan Selatan	Kab. Kotabaru
Prov. Kalimantan Selatan	Kab. Tabalong
Prov. Kalimantan Selatan	Kab. Tanah Bumbu
Prov. Kalimantan Selatan	Kab. Tanah Laut
Prov. Kalimantan Selatan	Kab. Tapin
Prov. Kalimantan Selatan	Kota Banjarbaru
Prov. Kalimantan Selatan	Kota Banjarmasin
Prov. Kalimantan Tengah	Kab. Barito Selatan
Prov. Kalimantan Tengah	Kab. Barito Timur
Prov. Kalimantan Tengah	Kab. Barito Utara
Prov. Kalimantan Tengah	Kab. Gunung Mas
Prov. Kalimantan Tengah	Kab. Kapuas
Prov. Kalimantan Tengah	Kab. Katingan
Prov. Kalimantan Tengah	Kab. Kotawaringin Barat
Prov. Kalimantan Tengah	Kab. Kotawaringin Timur
Prov. Kalimantan Tengah	Kab. Lamandau
Prov. Kalimantan Tengah	Kab. Murung Raya
Prov. Kalimantan Tengah	Kab. Pulang Pisau
Prov. Kalimantan Tengah	Kab. Seruyan
Prov. Kalimantan Tengah	Kab. Sukamara
Prov. Kalimantan Tengah	Kota Palangka Raya
Prov. Kalimantan Timur	Kab. Berau
Prov. Kalimantan Timur	Kab. Kutai Barat
Prov. Kalimantan Timur	Kab. Kutai Kartanegara
Prov. Kalimantan Timur	Kab. Kutai Timur
Prov. Kalimantan Timur	Kab. Mahakam Ulu
Prov. Kalimantan Timur	Kab. Paser
Prov. Kalimantan Timur	Kab. Penajam Paser Utara
Prov. Kalimantan Timur	Kota Balikpapan
Prov. Kalimantan Timur	Kota Bontang
Prov. Kalimantan Timur	Kota Samarinda
Prov. Kalimantan Utara	Kab. Bulungan
Prov. Kalimantan Utara	Kab. Malinau
Prov. Kalimantan Utara	Kab. Nunukan
Prov. Kalimantan Utara	Kab. Tana Tidung
Prov. Kalimantan Utara	Kota Tarakan
Prov. Kepulauan Bangka Belitung	Kab. Bangka
Prov. Kepulauan Bangka Belitung	Kab. Bangka Barat
Prov. Kepulauan Bangka Belitung	Kab. Bangka Selatan
Prov. Kepulauan Bangka Belitung	Kab. Bangka Tengah
Prov. Kepulauan Bangka Belitung	Kab. Belitung
Prov. Kepulauan Bangka Belitung	Kab. Belitung Timur
Prov. Kepulauan Bangka Belitung	Kota Pangkalpinang
Prov. Kepulauan Riau	Kab. Bintan
Prov. Kepulauan Riau	Kab. Karimun
Prov. Kepulauan Riau	Kab. Kepulauan Anambas
Prov. Kepulauan Riau	Kab. Lingga
Prov. Kepulauan Riau	Kab. Natuna
Prov. Kepulauan Riau	Kota Batam
Prov. Kepulauan Riau	Kota Tanjungpinang
Prov. Lampung	Kab. Lampung Barat
Prov. Lampung	Kab. Lampung Selatan
Prov. Lampung	Kab. Lampung Tengah
Prov. Lampung	Kab. Lampung Timur
Prov. Lampung	Kab. Lampung Utara
Prov. Lampung	Kab. Mesuji
Prov. Lampung	Kab. Pesawaran
Prov. Lampung	Kab. Pesisir Barat
Prov. Lampung	Kab. Pringsewu
Prov. Lampung	Kab. Tanggamus
Prov. Lampung	Kab. Tulang Bawang
Prov. Lampung	Kab. Tulang Bawang Barat
Prov. Lampung	Kab. Way Kanan
Prov. Lampung	Kota Bandar Lampung
Prov. Lampung	Kota Metro
Prov. Maluku	Kab. Buru
Prov. Maluku	Kab. Buru Selatan
Prov. Maluku	Kab. Kepulauan Aru
Prov. Maluku	Kab. Kepulauan Tanimbar
Prov. Maluku	Kab. Maluku Barat Daya
Prov. Maluku	Kab. Maluku Tengah
Prov. Maluku	Kab. Maluku Tenggara
Prov. Maluku	Kab. Seram Bagian Barat
Prov. Maluku	Kab. Seram Bagian Timur
Prov. Maluku	Kota Ambon
Prov. Maluku	Kota Tual
Prov. Maluku Utara	Kab. Halmahera Barat
Prov. Maluku Utara	Kab. Halmahera Selatan
Prov. Maluku Utara	Kab. Halmahera Tengah
Prov. Maluku Utara	Kab. Halmahera Timur
Prov. Maluku Utara	Kab. halmahera Utara
Prov. Maluku Utara	Kab. Kepulauan Morotai
Prov. Maluku Utara	Kab. Kepulauan Sula
Prov. Maluku Utara	Kab. Pulau Taliabu
Prov. Maluku Utara	Kota Ternate
Prov. Maluku Utara	Kota Tidore Kepulauan
Prov. Nusa Tenggara Barat	Kab. Bima
Prov. Nusa Tenggara Barat	Kab. Dompu
Prov. Nusa Tenggara Barat	Kab. Lombok Barat
Prov. Nusa Tenggara Barat	Kab. Lombok Tengah
Prov. Nusa Tenggara Barat	Kab. Lombok Timur
Prov. Nusa Tenggara Barat	Kab. Lombok Utara
Prov. Nusa Tenggara Barat	Kab. Sumbawa
Prov. Nusa Tenggara Barat	Kab. Sumbawa Barat
Prov. Nusa Tenggara Barat	Kota Bima
Prov. Nusa Tenggara Barat	Kota Mataram
Prov. Nusa Tenggara Timur	Kab. Alor
Prov. Nusa Tenggara Timur	Kab. Belu
Prov. Nusa Tenggara Timur	Kab. Ende
Prov. Nusa Tenggara Timur	Kab. Flores Timur
Prov. Nusa Tenggara Timur	Kab. Kupang
Prov. Nusa Tenggara Timur	Kab. Lembata
Prov. Nusa Tenggara Timur	Kab. Malaka
Prov. Nusa Tenggara Timur	Kab. Manggarai
Prov. Nusa Tenggara Timur	Kab. Manggarai Barat
Prov. Nusa Tenggara Timur	Kab. Manggarai Timur
Prov. Nusa Tenggara Timur	Kab. Nagekeo
Prov. Nusa Tenggara Timur	Kab. Ngada
Prov. Nusa Tenggara Timur	Kab. Rote-Ndao
Prov. Nusa Tenggara Timur	Kab. Sabu Raijua
Prov. Nusa Tenggara Timur	Kab. Sikka
Prov. Nusa Tenggara Timur	Kab. Sumba Barat
Prov. Nusa Tenggara Timur	Kab. Sumba Barat Daya
Prov. Nusa Tenggara Timur	Kab. Sumba Tengah
Prov. Nusa Tenggara Timur	Kab. Sumba Timur
Prov. Nusa Tenggara Timur	Kab. Timor Tengah Selatan
Prov. Nusa Tenggara Timur	Kab. Timor Tengah Utara
Prov. Nusa Tenggara Timur	Kota Kupang
Prov. Papua	Kab. Biak Numfor
Prov. Papua	Kab. Jayapura
Prov. Papua	Kab. Keerom
Prov. Papua	Kab. Kepulauan Yapen
Prov. Papua	Kab. Memberamo Raya
Prov. Papua	Kab. Sarmi
Prov. Papua	Kab. Supiori
Prov. Papua	Kab. Waropen
Prov. Papua	Kota Jayapura
Prov. Papua Barat	Kab. Fak-Fak
Prov. Papua Barat	Kab. Kaimana
Prov. Papua Barat	Kab. Manokwari
Prov. Papua Barat	Kab. Manokwari Selatan
Prov. Papua Barat	Kab. Pegunungan Arfak
Prov. Papua Barat	Kab. Teluk Bintuni
Prov. Papua Barat	Kab. Teluk Wondama
Prov. Papua Barat Daya (Pemekaran 2023)	Kab. Maybrat (Pemekaran 2023)
Prov. Papua Barat Daya (Pemekaran 2023)	Kab. Raja Ampat (Pemekaran 2023)
Prov. Papua Barat Daya (Pemekaran 2023)	Kab. Sorong (Pemekaran 2023)
Prov. Papua Barat Daya (Pemekaran 2023)	Kab. Sorong Selatan (Pemekaran 2023)
Prov. Papua Barat Daya (Pemekaran 2023)	Kab. Tambrauw (Pemekaran 2023)
Prov. Papua Barat Daya (Pemekaran 2023)	Kota Sorong (Pemekaran 2023)
Prov. Papua Pegunungan (Pemekaran 2023)	Kab. Jayawijaya (Pemekaran 2023)
Prov. Papua Pegunungan (Pemekaran 2023)	Kab. Lanny Jaya (Pemekaran 2023)
Prov. Papua Pegunungan (Pemekaran 2023)	Kab. Mamberamo Tengah (Pemekaran 2023)
Prov. Papua Pegunungan (Pemekaran 2023)	Kab. Nduga (Pemekaran 2023)
Prov. Papua Pegunungan (Pemekaran 2023)	Kab. Pegunungan Bintang (Pemekaran 2023)
Prov. Papua Pegunungan (Pemekaran 2023)	Kab. Tolikara (Pemekaran 2023)
Prov. Papua Pegunungan (Pemekaran 2023)	Kab. Yahukimo (Pemekaran 2023)
Prov. Papua Pegunungan (Pemekaran 2023)	Kab. Yalimo (Pemekaran 2023)
Prov. Papua Selatan (Pemekaran 2023)	Kab. Asmat (Pemekaran 2023)
Prov. Papua Selatan (Pemekaran 2023)	Kab. Boven Digoel (Pemekaran 2023)
Prov. Papua Selatan (Pemekaran 2023)	Kab. Mappi (Pemekaran 2023)
Prov. Papua Selatan (Pemekaran 2023)	Kab. Merauke (Pemekaran 2023)
Prov. Papua Tengah (Pemekaran 2023)	Kab. Deiyai (Pemekaran 2023)
Prov. Papua Tengah (Pemekaran 2023)	Kab. Dogiyai (Pemekaran 2023)
Prov. Papua Tengah (Pemekaran 2023)	Kab. Intan Jaya (Pemekaran 2023)
Prov. Papua Tengah (Pemekaran 2023)	Kab. Mimika (Pemekaran 2023)
Prov. Papua Tengah (Pemekaran 2023)	Kab. Nabire (Pemekaran 2023)
Prov. Papua Tengah (Pemekaran 2023)	Kab. Paniai (Pemekaran 2023)
Prov. Papua Tengah (Pemekaran 2023)	Kab. Puncak (Pemekaran 2023)
Prov. Papua Tengah (Pemekaran 2023)	Kab. Puncak Jaya (Pemekaran 2023)
Prov. Riau	Kab. Bengkalis
Prov. Riau	Kab. Indragiri Hilir
Prov. Riau	Kab. Indragiri Hulu
Prov. Riau	Kab. Kampar
Prov. Riau	Kab. Kepulauan Meranti
Prov. Riau	Kab. Kuantan Singingi
Prov. Riau	Kab. Pelalawan
Prov. Riau	Kab. Rokan Hilir
Prov. Riau	Kab. Rokan Hulu
Prov. Riau	Kab. Siak
Prov. Riau	Kota Dumai
Prov. Riau	Kota Pekanbaru
Prov. Sulawesi Barat	Kab. Majene
Prov. Sulawesi Barat	Kab. Mamasa
Prov. Sulawesi Barat	Kab. Mamuju
Prov. Sulawesi Barat	Kab. Mamuju Tengah
Prov. Sulawesi Barat	Kab. Pasangkayu
Prov. Sulawesi Barat	Kab. Polewali Mandar
Prov. Sulawesi Selatan	Kab. Bantaeng
Prov. Sulawesi Selatan	Kab. Barru
Prov. Sulawesi Selatan	Kab. Bone
Prov. Sulawesi Selatan	Kab. Bulukumba
Prov. Sulawesi Selatan	Kab. Enrekang
Prov. Sulawesi Selatan	Kab. Gowa
Prov. Sulawesi Selatan	Kab. Jeneponto
Prov. Sulawesi Selatan	Kab. Kepulauan Selayar
Prov. Sulawesi Selatan	Kab. Luwu
Prov. Sulawesi Selatan	Kab. Luwu Timur
Prov. Sulawesi Selatan	Kab. Luwu Utara
Prov. Sulawesi Selatan	Kab. Maros
Prov. Sulawesi Selatan	Kab. Pangkajene Kepulauan
Prov. Sulawesi Selatan	Kab. Pinrang
Prov. Sulawesi Selatan	Kab. Sidenreng Rappang
Prov. Sulawesi Selatan	Kab. Sinjai
Prov. Sulawesi Selatan	Kab. Soppeng
Prov. Sulawesi Selatan	Kab. Takalar
Prov. Sulawesi Selatan	Kab. Tana Toraja
Prov. Sulawesi Selatan	Kab. Toraja Utara
Prov. Sulawesi Selatan	Kab. Wajo
Prov. Sulawesi Selatan	Kota Makassar
Prov. Sulawesi Selatan	Kota Palopo
Prov. Sulawesi Selatan	Kota Parepare
Prov. Sulawesi Tengah	Kab. Banggai
Prov. Sulawesi Tengah	Kab. Banggai Kepulauan
Prov. Sulawesi Tengah	Kab. Banggai Laut
Prov. Sulawesi Tengah	Kab. Buol
Prov. Sulawesi Tengah	Kab. Donggala
Prov. Sulawesi Tengah	Kab. Morowali
Prov. Sulawesi Tengah	Kab. Morowali Utara
Prov. Sulawesi Tengah	Kab. Parigi Moutong
Prov. Sulawesi Tengah	Kab. Poso
Prov. Sulawesi Tengah	Kab. Sigi
Prov. Sulawesi Tengah	Kab. Tojo Una-Una
Prov. Sulawesi Tengah	Kab. Tolitoli
Prov. Sulawesi Tengah	Kota Palu
Prov. Sulawesi Tenggara	Kab. Bombana
Prov. Sulawesi Tenggara	Kab. Buton
Prov. Sulawesi Tenggara	Kab. Buton Selatan
Prov. Sulawesi Tenggara	Kab. Buton Tengah
Prov. Sulawesi Tenggara	Kab. Buton Utara
Prov. Sulawesi Tenggara	Kab. Kolaka
Prov. Sulawesi Tenggara	Kab. Kolaka Timur
Prov. Sulawesi Tenggara	Kab. Kolaka Utara
Prov. Sulawesi Tenggara	Kab. Konawe
Prov. Sulawesi Tenggara	Kab. Konawe Kepulauan
Prov. Sulawesi Tenggara	Kab. Konawe Selatan
Prov. Sulawesi Tenggara	Kab. Konawe Utara
Prov. Sulawesi Tenggara	Kab. Muna
Prov. Sulawesi Tenggara	Kab. Muna Barat
Prov. Sulawesi Tenggara	Kab. Wakatobi
Prov. Sulawesi Tenggara	Kota Baubau
Prov. Sulawesi Tenggara	Kota Kendari
Prov. Sulawesi Utara	Kab. Bolaang Mongondow
Prov. Sulawesi Utara	Kab. Bolaang Mongondow Selatan
Prov. Sulawesi Utara	Kab. Bolaang Mongondow Timur
Prov. Sulawesi Utara	Kab. Bolaang Mongondow Utara
Prov. Sulawesi Utara	Kab. Kep. Sangihe
Prov. Sulawesi Utara	Kab. Kepulauan Siau Tagulandang Biaro
Prov. Sulawesi Utara	Kab. Kepulauan Talaud
Prov. Sulawesi Utara	Kab. Minahasa
Prov. Sulawesi Utara	Kab. Minahasa Selatan
Prov. Sulawesi Utara	Kab. Minahasa Tenggara
Prov. Sulawesi Utara	Kab. Minahasa Utara
Prov. Sulawesi Utara	Kota Bitung
Prov. Sulawesi Utara	Kota Kotamobagu
Prov. Sulawesi Utara	Kota Manado
Prov. Sulawesi Utara	Kota Tomohon
Prov. Sumatera Barat	Kab. Agam
Prov. Sumatera Barat	Kab. Dharmasraya
Prov. Sumatera Barat	Kab. Kepulauan Mentawai
Prov. Sumatera Barat	Kab. Lima Puluh Koto
Prov. Sumatera Barat	Kab. Padang Pariaman
Prov. Sumatera Barat	Kab. Pasaman
Prov. Sumatera Barat	Kab. Pasaman Barat
Prov. Sumatera Barat	Kab. Pesisir Selatan
Prov. Sumatera Barat	Kab. Sijunjung
Prov. Sumatera Barat	Kab. Solok
Prov. Sumatera Barat	Kab. Solok Selatan
Prov. Sumatera Barat	Kab. Tanah Datar
Prov. Sumatera Barat	Kota Bukittinggi
Prov. Sumatera Barat	Kota Padang
Prov. Sumatera Barat	Kota Padang Panjang
Prov. Sumatera Barat	Kota Pariaman
Prov. Sumatera Barat	Kota Payakumbuh
Prov. Sumatera Barat	Kota Sawah Lunto
Prov. Sumatera Barat	Kota Solok
Prov. Sumatera Selatan	Kab. Banyuasin
Prov. Sumatera Selatan	Kab. Empat Lawang
Prov. Sumatera Selatan	Kab. Lahat
Prov. Sumatera Selatan	Kab. Muara Enim
Prov. Sumatera Selatan	Kab. Musi Banyuasin
Prov. Sumatera Selatan	Kab. Musi Rawas
Prov. Sumatera Selatan	Kab. Musi Rawas Utara
Prov. Sumatera Selatan	Kab. Ogan Ilir
Prov. Sumatera Selatan	Kab. Ogan Komering Ilir
Prov. Sumatera Selatan	Kab. Ogan Komering Ulu
Prov. Sumatera Selatan	Kab. Ogan Komering Ulu Selatan
Prov. Sumatera Selatan	Kab. Ogan Komering Ulu Timur
Prov. Sumatera Selatan	Kab. Penukal Abab Lematang Ilir
Prov. Sumatera Selatan	Kota Lubuk Linggau
Prov. Sumatera Selatan	Kota Pagar Alam
Prov. Sumatera Selatan	Kota Palembang
Prov. Sumatera Selatan	Kota Prabumulih
Prov. Sumatera Utara	Kab. Asahan
Prov. Sumatera Utara	Kab. Batubara
Prov. Sumatera Utara	Kab. Dairi
Prov. Sumatera Utara	Kab. Deli Serdang
Prov. Sumatera Utara	Kab. Humbang Hasudutan
Prov. Sumatera Utara	Kab. Karo
Prov. Sumatera Utara	Kab. Labuhan Batu
Prov. Sumatera Utara	Kab. Labuhan Batu Selatan
Prov. Sumatera Utara	Kab. Labuhan Batu Utara
Prov. Sumatera Utara	Kab. Langkat
Prov. Sumatera Utara	Kab. Mandailing Natal
Prov. Sumatera Utara	Kab. Nias
Prov. Sumatera Utara	Kab. Nias Barat
Prov. Sumatera Utara	Kab. Nias Selatan
Prov. Sumatera Utara	Kab. Nias Utara
Prov. Sumatera Utara	Kab. Padang Lawas
Prov. Sumatera Utara	Kab. Padang Lawas utara
Prov. Sumatera Utara	Kab. Pakpak Bharat
Prov. Sumatera Utara	Kab. Samosir
Prov. Sumatera Utara	Kab. Serdang Bedagai
Prov. Sumatera Utara	Kab. Simalungun
Prov. Sumatera Utara	Kab. Tapanuli Selatan
Prov. Sumatera Utara	Kab. Tapanuli Tengah
Prov. Sumatera Utara	Kab. Tapanuli Utara
Prov. Sumatera Utara	Kab. Toba
Prov. Sumatera Utara	Kota Binjai
Prov. Sumatera Utara	Kota Gunungsitoli
Prov. Sumatera Utara	Kota Medan
Prov. Sumatera Utara	Kota Padang Sidimpuan
Prov. Sumatera Utara	Kota Pematangsiantar
Prov. Sumatera Utara	Kota Sibolga
Prov. Sumatera Utara	Kota Tanjung Balai
Prov. Sumatera Utara	Kota Tebing Tinggi
`.trim();

export function normalizeProvinceName(value: string): string {
  return value
    .replace(/^Prov\.\s*/i, "")
    .replace(/\s*\(Pemekaran 2023\)/gi, "")
    .trim();
}

export function normalizeKabKotaName(value: string): string {
  return value
    .replace(/\s*\(Pemekaran 2023\)/gi, "")
    .trim();
}

export function buildWilayah514(raw: string): Wilayah514 {
  return raw
    .split(/\r?\n/)
    .slice(1)
    .reduce<Wilayah514>((acc, line) => {
      const [provinceRaw, kabKotaRaw] = line.split("\t");

      if (!provinceRaw || !kabKotaRaw) return acc;

      const province = normalizeProvinceName(provinceRaw);
      const kabKota = normalizeKabKotaName(kabKotaRaw);

      if (!acc[province]) acc[province] = [];
      if (!acc[province].includes(kabKota)) acc[province].push(kabKota);

      return acc;
    }, {});
}

export const WILAYAH_514 = buildWilayah514(RAW_WILAYAH_514);

export const PROVINSI_514 = Object.keys(WILAYAH_514);

export function getKabKotaByProvinsi(provinsi: string): string[] {
  return WILAYAH_514[provinsi] ?? [];
}
