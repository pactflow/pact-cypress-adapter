import { useEffect, useState } from 'react'

function App() {
  const [todos, setTodos] = useState([])
  useEffect(() => {
    async function fetchTodos() {
      let response = await fetch('/api/todo', {
        headers: {
          'x-pactflow': 'blah',
          'ignore-me': 'ignore',
          'ignore-me-globally': 'ignore'
        }
      })
      response = await response.json()
      setTodos(response)
    }
    fetchTodos()
  }, [])
  return (
    <div className="App">
      {todos.length === 1 ? (
        <p>No todos is found</p>
      ) : (
        <ul>
          {todos.map((todo, i) => {
            return <li key={i}>{todo.content}</li>
          })}
        </ul>
      )}
    </div>
  )
}

export default App
