import { useEffect, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);
  useEffect(() => {
    async function fetchTodos() {
      let response = await fetch("/api/todo", {
        headers: {
          "x-pactflow": "blah",
          "ignore-me": "ignore",
          "ignore-me-globally": "ignore",
        },
      });
      response = await response.json();
      setTodos(response);
    }
    fetchTodos();
  }, []);
  return (
    // biome-ignore lint/suspicious/noReactSpecificProps: this is a React app; className is the correct DOM prop here, not the "class" attribute the rule suggests.
    <div className="App">
      {/* biome-ignore lint/style/noTernary: idiomatic React conditional rendering inside JSX. */}
      {todos.length === 0 ? (
        // biome-ignore lint/style/noJsxLiterals: demo app with hardcoded English strings and no i18n requirement.
        <p>No todos is found</p>
      ) : (
        <ul>
          {/* biome-ignore lint/performance/useSolidForComponent: this is a React project, not SolidJS; Array.prototype.map is the standard React list-rendering pattern. */}
          {todos.map((todo, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: the fixture list is fetched once and never reordered or mutated, and the API response has no unique id field to key on.
            <li key={i}>{todo.content}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// biome-ignore lint/style/noDefaultExport: React component modules default-export by convention.
export default App;
