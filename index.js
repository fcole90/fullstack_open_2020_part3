const cors = require('cors')
const express = require('express')
const morgan = require('morgan')

const app = express()

let persons = [
  { 
    "name": "Arto Hellas", 
    "number": "040-123456",
    "id": 1
  },
  { 
    "name": "Ada Lovelace", 
    "number": "39-44-5323523",
    "id": 2
  },
  { 
    "name": "Dan Abramov", 
    "number": "12-43-234345",
    "id": 3
  },
  { 
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122",
    "id": 4
  }
]

// --- Helper functions ---
const generateId = () => {
  const currentIds = persons.map(person => person.id)

  while(true) {
    const newId = Math.floor(Math.random() * Math.floor(999999))

    if (!currentIds.includes(newId))  {
      return newId
    }
  }
}

morgan.token('body', (req, res) => {
  return JSON.stringify(req.body)
 })

// --- Middleware ---
app.use(cors())
app.use(express.json())

// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method)
//   console.log('Path:  ', request.path)
//   console.log('Body:  ', request.body)
//   console.log('---')
//   next()
// }
// app.use(requestLogger)

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// *--------------*
// |### Routes ###|
// *--------------*

// --- DELETE ---
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)

  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})


// --- GET ---
app.get('/', (request, response) => {
  response.send('<a href="/api/persons"><pre>/api/persons</pre></a>')
})


app.get('/info', (request, response) => {
  response.send(
  `<p>Phonebook has info for ${persons.length} people</p>` +
  `<p>${new Date()}</p>`
  )
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(note => note.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

// --- POST ---
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'Missing name'
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'Missing number'
    })
  }

  if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({ 
      error: `name must be unique - '${body.name}' already exists`
    })
  }

  const {name, number} = body
  const person = {
    name,
    number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

// After routes Middleware
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)



// --- Main ---
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
