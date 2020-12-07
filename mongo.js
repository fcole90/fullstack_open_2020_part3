const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log(`Error: You provided ${process.argv.length} arguments!`)
  console.log('Usage:')
  console.log('- get all: node mongo.js <yourpassword>')
  console.log('- add new: node mongo.js <yourpassword> <name> <number>')
  process.exit(1)
}

const password = process.argv[2]

const url =  `mongodb+srv://fullstack:${password}@cluster0.kaqlx.mongodb.net/phonebook?retryWrites=true`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})
const Person = mongoose.model('Person', personSchema)


const loadPeople = () => {
  Person.find({})
  .then(result => {
    console.log("phonebook:");
    result.forEach(({name, number}) => {
      console.log(name, number)
    })
  })
  .catch(err => {
    console.err(err)
  })
  .finally(() => {
    mongoose.connection.close()
  })
}

const addPerson = (name, number) => {
  new Person({
    name,
    number
  })
  .save()
  .then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
  })
  .catch(err => {
    console.err(err)
  })
  .finally(() => {
    mongoose.connection.close()
  })
}


if (process.argv.length === 5) {
  addPerson(process.argv[3], process.argv[4])
}
else {
  loadPeople()
}