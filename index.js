require('dotenv').config()
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')

const Person = require('./models/person')

const app = express()

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

// --- Middleware ---
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

// Logger with custom args
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// *--------------*
// |### Routes ###|
// *--------------*

// --- DELETE ---
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      console.log('DELETE Result:', result)
      if (result) {
        response.status(204).end()
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})


// --- GET ---
app.get('/', (request, response) => {
  response.send('<a href="/api/persons"><pre>/api/persons</pre></a>')
})


app.get('/info', (request, response, next) => {
  Person.find({})
    .then(people => {
      response.send(
        `<p>Phonebook has info for ${people.length} people</p>` +
      `<p>${new Date()}</p>`
      )
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(people => {
      response.json(people)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

// --- POST ---
app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body


  new Person({
    name,
    number
  })
    .save()
    .then(result => {
      console.log(`added ${name} number ${number} to phonebook`)
      response.json(result)
    })
    .catch(error => next(error))

})

// --- PUT ---
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  const person = {
    name,
    number
  }

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }

    })
    .catch(error => next(error))
})

// After routes Middleware
// Needs to be after routes, otherwise it would answer before them
const unknownEndpoint = (request, response) => {
  console.log('Unknown endpoint:', response)
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// Generic error handler
const errorHandler = (error, request, response, next) => {
  console.log('Error Handler:', error)
  if (error.name === 'ValidationError') {
    response.status(500).send({ error: error.message })
  }  else {
    response.status(500).send({ error: `server error: ${error.name}` })
  }

  next(error)
}
app.use(errorHandler)


// --- Main ---
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
