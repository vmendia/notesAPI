require('dotenv').config()

const express = require('express');

const Note = require('./models/note')

const app = express();


// const password = process.argv[2]

// DO NOT SAVE YOUR PASSWORD TO GITHUB !!
// const url = `mongodb+srv://fullstackdev:${password}@fullstackdev.tzwqcse.mongodb.net/noteApp?retryWrites=true&w=majority`

// mongoose.set('strictQuery', false)
// mongoose.connect(url)

/* 
const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean
})
*/

/*
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
*/

// const Note = mongoose.model('Note', noteSchema)

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('---')
  next()
}

// order of middleware use is very Importsnt !
app.use(express.json());
app.use(requestLogger)
app.use(express.static('build'))


const cors = require('cors')
app.use(cors())

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
  ]


app.get('/', (request, response) => { 
    response.send('<h1>Hello World</h1>')
})

app.get('/api/notes', (request, response) => { 
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter( n => n.id !== id )
    response.status(204).end()
})

app.put('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)

  if (id === undefined) {
    return (response.status(404).send({ error: 'Resource Identifier not valid' }))
  }

  const note = notes.find( n => n.id === id )

  if (note === undefined) {
    return (response.status(404).send({ error: 'Resource not found' }))
  }

  const updatedNotes = notes.filter( n => n.id !== id )

  // receive parsed json data - using express.json() parser
  const body = request.body

  const newNote = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: id
  }

  updatedNotes.push(newNote)

  response.json(newNote)

})

app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find( n => n.id === id )
    if (note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})


app.post('/api/notes', (request, response) => {
  
  // receive parsed json data - using express.json() parser
  const body = request.body

  // find next id to use
  const id = notes.reduce( (r, n) =>  (n.id >= r) ? (n.id+1) : r  , 0 ) 
  
  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: id
  }

  notes.push(note)

  response.json(note)
})  

const unknownEndpoint = (request, response) => {
  console.log('unknown endpoint')
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})