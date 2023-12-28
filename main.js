const fs = require('fs')
const prompt = require('prompt-sync')()
const { appendFile } = require('fs').promises
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

console.log('Selamat datang di Program Perpustakaan!')

class Book {
  constructor(title, author, release, stock) {
    this.title = title
    this.author = author
    this.release = release
    this.stock = stock
  }
}

class Borrowing {
  constructor(title, borrowerName, startDate, endDate) {
    this.title = title
    this.borrowerName = borrowerName
    this.startDate = startDate
    this.endDate = endDate
  }
}

const readBooksFromDatabase = () => {
  try {
    const data = fs.readFileSync('books-database.json', 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

const readBorrowingsFromDatabase = () => {
  try {
    const data = fs.readFileSync('borrowings-database.json', 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

const displayAllBooks = () => {
  const existingBooks = readBooksFromDatabase()

  if (existingBooks.length > 0) {
    console.log('')
    existingBooks.forEach((book) => {
      console.log(`- Judul Buku: ${book.title}, Pengarang: ${book.author}, Tahun Terbit: ${book.release}, Stok: ${book.stock}`)
    })
  } else {
    console.log('Tidak ada data buku.')
  }
}

const displayAllBorrowings = () => {
  const borrowings = readBorrowingsFromDatabase()
  
  if (borrowings.length > 0) {
    console.log('')
    borrowings.forEach((borrowing) => {
      console.log(`- Judul: ${borrowing.title}, Peminjam: ${borrowing.borrowerName}, Tanggal Pinjam: ${borrowing.startDate}, Tanggal Kembali: ${borrowing.endDate}`)
    })
  } else {
    console.log('Tidak ada data peminjaman.')
  }
}

const addBook = (argTitle, argAuthor, argRelease, argStock) => {
  const existingBooks = readBooksFromDatabase()

  let title, author, release, stock
  if (argv.judul && argv.pengarang && argv.tahun && argv.stok) {
    title = argTitle
    author = argAuthor
    release = argRelease
    stock = parseInt(argStock)
  } else {
    console.log('\nSilahkan isi informasi berikut!')

    title = prompt('Judul buku: ')
    author = prompt('Nama pengarang: ')
    release = prompt('Tahun terbit: ')
    stock = parseInt(prompt('Jumlah stok: '))
  }

  const newBook = new Book(title, author, release, stock)
  existingBooks.push(newBook)

  const dataJSON = JSON.stringify(existingBooks, null, 2)
  fs.writeFileSync('books-database.json', dataJSON)
  console.log('Buku baru berhasil ditambahkan!')
}

const findBook = (argKeyword) => {
  if (argv.judul) {
    keyword = argKeyword
  } else {
    console.log('\nSilahkan isi informasi berikut!')
    keyword = prompt('Judul buku yang akan dicari: ')
  }

  const existingBooks = readBooksFromDatabase()
  const existingBook = existingBooks.filter(book => book.title.toLowerCase().includes(keyword.toLowerCase()))

  if (existingBook.length > 0) {
    console.log('Buku yang ditemukan:')
    existingBook.forEach(book => {
      console.log(`- Judul: ${book.title}, Pengarang: ${book.author}, Tahun Terbit: ${book.release}, Stok: ${book.stock}`)
    })
  } else {
    console.log('Buku tidak ditemukan.')
  }
}

const deleteBook = (argKeyword) => {
  if (argv.judul) {
    keyword = argKeyword
  } else {
    displayAllBooks()
  
    console.log('\nSilahkan isi informasi berikut!')
    keyword = prompt('Judul buku yang akan dihapus: ')
  }
  

  const existingBooks = readBooksFromDatabase()
  const existingBook = existingBooks.findIndex(book => book.title.toLowerCase() === keyword.toLowerCase())

  if (existingBook !== -1) {
    existingBooks.splice(existingBook, 1)

    const dataJSON = JSON.stringify(existingBooks, null, 2)
    fs.writeFileSync('books-database.json', dataJSON)

    console.log(`Buku berhasil dihapus.`)
  } else {
    console.log(`Buku tidak ditemukan.`)
  }
}

const addBorrowing = (argKeyword, argBorrowerName, argEndDate) => {
  let keyword, borrowerName
  if (argv.judul && argv.peminjam) {
    keyword = argKeyword
    borrowerName = argBorrowerName
  } else {
    displayAllBooks()

    console.log('\nSilahkan isi informasi berikut!')
    keyword = prompt('Judul buku yang akan dipinjam: ')
    borrowerName = prompt('Peminjam: ')
  }


  const existingBooks = readBooksFromDatabase()
  const existingBook = existingBooks.find(book => book.title.toLowerCase() === keyword.toLowerCase())
  
  if (existingBook) {
    if (existingBook.stock > 0) {
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = (argv.judul && argv.peminjam) ? argEndDate : prompt('Tanggal Pengembalian (YYYY-MM-DD): ')

      const newBorrowing = new Borrowing(keyword, borrowerName, startDate, endDate)
      const borrowings = readBorrowingsFromDatabase()
      updateBookStock(keyword, 1)
      borrowings.push(newBorrowing)

      const dataJSON = JSON.stringify(borrowings, null, 2)
      fs.writeFileSync('borrowings-database.json', dataJSON)
      console.log(`Buku berhasil dipinjam oleh ${borrowerName}.`)
    } else {
      console.log(`Maaf, stok buku habis. Tidak dapat melakukan peminjaman.`)
    }
  } else {
    console.log(`Buku tidak ditemukan.`)
  }
}

const findBorrowing = (argKeyword) => {
  if (argv.judul) {
    keyword = argKeyword
  } else {
    console.log('\nSilahkan isi informasi berikut!')
    keyword = prompt('Judul buku yang akan dicari: ')
  }

  const borrowings = readBorrowingsFromDatabase()
  const foundBorrowings = borrowings.filter(borrowing => borrowing.title.toLowerCase().includes(keyword.toLowerCase()))

  if (foundBorrowings.length > 0) {
    console.log('Data Peminjaman yang ditemukan:')
    foundBorrowings.forEach(borrowing => {
      console.log(`- Judul: ${borrowing.title}, Peminjam: ${borrowing.borrowerName}, Tanggal Pinjam: ${borrowing.startDate}, Tanggal Kembali: ${borrowing.endDate}`)
    })
  } else {
    console.log('Data Peminjaman tidak ditemukan.')
  }
}

const deleteBorrowing = () => {
  displayAllBorrowings()

  console.log('\nSilahkan isi informasi berikut!')
  const keyword = prompt('Judul buku yang akan dihapus dari peminjaman: ')

  const borrowings = readBorrowingsFromDatabase()
  const borrowingIndex = borrowings.findIndex(borrowing => borrowing.title.toLowerCase() === keyword.toLowerCase())

  if (borrowingIndex !== -1) {
    const returnedBook = borrowings.splice(borrowingIndex, 1)[0]
    updateBookStock(returnedBook.title, -1)

    const dataJSON = JSON.stringify(borrowings, null, 2)
    fs.writeFileSync('borrowings-database.json', dataJSON)

    console.log(`Data Peminjaman berhasil dihapus.`)
  } else {
    console.log(`Data Peminjaman tidak ditemukan.`)
  }
}

const updateBookStock = (title, stockChange) => {
  const existingBooks = readBooksFromDatabase()
  const bookIndex = existingBooks.findIndex(book => book.title.toLowerCase() === title.toLowerCase())

  if (bookIndex !== -1) {
    existingBooks[bookIndex].stock -= stockChange

    const dataJSON = JSON.stringify(existingBooks, null, 2)
    fs.writeFileSync('books-database.json', dataJSON)
  }
}

if (!process.argv[2]) {
  let menu
  do {
    console.log(`
Menu Program Perpustakaan:
1. Tambah Buku
2. Cari Buku
3. Hapus Buku
4. Daftar Buku
5. Tambah Peminjaman
6. Cari Peminjaman
7. Hapus Peminjaman
8. Daftar Peminjam
9. Keluar
    `)
    
    const selection = parseInt(prompt('Pilih Menu (1-9): '))
    menu = selection

    switch (menu) {
      case 1:
        addBook()
        break
      case 2:
        findBook()
        break
      case 3:
        deleteBook()
        break
      case 4:
        displayAllBooks()
        break
      case 5:
        addBorrowing()
        break
      case 6:
        findBorrowing()
        break
      case 7:
        deleteBorrowing()
        break
      case 8:
        displayAllBorrowings()
        break
      default:
        console.log('Terimakasih, sampai jumpa lagi 👋.')
        break
    }
  } while (menu !== 9)
} else {
  const command = process.argv[2]

  switch (command) {
    case 'tambah_buku':
      addBook(argv.judul, argv.pengarang, argv.tahun, argv.stok)
      break
    case 'cari_buku':
      findBook(argv.judul)
      break
    case 'hapus_buku':
      deleteBook(argv.judul)
      break
    case 'daftar_buku':
      displayAllBooks()
      break
    case 'tambah_peminjaman':
      addBorrowing(argv.judul, argv.peminjam, argv.tanggal_pengembalian)
      break
    case 'cari_peminjaman':
      findBorrowing(argv.judul)
      break
    case 'hapus_peminjaman':
      deleteBorrowing()
      break
    case 'daftar_peminjaman':
      displayAllBorrowings()
      break
    default:
      console.log('Perintah tidak valid.')
  }
}