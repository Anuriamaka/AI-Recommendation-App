import React from "react"
import SelectField from "./components/Select"
import listOfGenreOption from "./store/genre.json"
import listOfMoodOption from "./store/mood.json"

// Define initial state
const initialState = {
  genre: '',
  mood: '',
  level: '',
  aiResponses: [],
  loading: false,
  error: null
}

// Define reducer function
function recommendationReducer(state, action) {
  switch (action.type) {
    case 'SET_GENRE':
      return { ...state, genre: action.payload, mood: '', level: '' } // Reset mood & level when genre changes
    case 'SET_MOOD':
      return { ...state, mood: action.payload }
    case 'SET_LEVEL':
      return { ...state, level: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_RESPONSES':
      return { ...state, aiResponses: action.payload, loading: false }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = React.useReducer(recommendationReducer, initialState)
  
  const availableMoodBasedOnGenre = listOfMoodOption[state.genre]

  // useCallback to memorize the fetch function
  const fetchRecommendations = React.useCallback(async () => {
    if (!state.genre || !state.mood || !state.level) return;

    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const GEMINI_API_KEY = 'AIzaSyAaitFnIuiRbEjr7EcmMq9Ieg5LQJzAs2I'
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Recommend 6 books for a ${state.level} ${state.genre} reader feeling ${state.mood}. For each book, provide:
1. Title and Author
2. Brief description (2-3 sentences)
3. Why it matches their mood and level

Format as a numbered list.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      console.log('API Response:', data)

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const newResponse = {
          text: data.candidates[0].content.parts[0].text,
          genre: state.genre,
          mood: state.mood,
          level: state.level,
          timestamp: new Date().toISOString()
        }
        dispatch({ 
          type: 'SET_RESPONSES', 
          payload: [...state.aiResponses, newResponse] 
        })
      } else {
        throw new Error('No recommendations received')
      }
    } catch (err) {
      console.error('Error:', err)
      dispatch({ type: 'SET_ERROR', payload: err.message })
    }
  }, [state.genre, state.mood, state.level, state.aiResponses])

  // useEffect to auto-fetch when all fields are filled
  React.useEffect(() => {
    // Optional: You can enable auto-fetch by uncommenting below
    // if (state.genre && state.mood && state.level) {
    //   fetchRecommendations()
    // }
  }, [state.genre, state.mood, state.level, fetchRecommendations])

  // useCallback for select handlers
  const handleGenreSelect = React.useCallback((value) => {
    dispatch({ type: 'SET_GENRE', payload: value })
  }, [])

  const handleMoodSelect = React.useCallback((value) => {
    dispatch({ type: 'SET_MOOD', payload: value })
  }, [])

  const handleLevelSelect = React.useCallback((value) => {
    dispatch({ type: 'SET_LEVEL', payload: value })
  }, [])

  return (
    <section style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📚 AI Book Recommender</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <SelectField
          placeholder="Please select a genre"
          id="genre"
          options={listOfGenreOption}
          onSelect={handleGenreSelect}
          value={state.genre}
        />

        <SelectField
          placeholder="Please select a mood"
          id="mood"
          options={availableMoodBasedOnGenre || []}
          onSelect={handleMoodSelect}
          value={state.mood}
          disabled={!state.genre}
        />

        <SelectField
          placeholder="Please select a level"
          id="level"
          options={['Beginner', 'Intermediate', 'Expert']}
          onSelect={handleLevelSelect}
          value={state.level}
        />

        <button 
          onClick={fetchRecommendations}
          disabled={!state.genre || !state.mood || !state.level || state.loading}
          style={{
            padding: '10px 20px',
            backgroundColor: state.loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: state.loading ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {state.loading ? 'Getting Recommendations...' : 'Get Recommendation'}
        </button>

        {state.error && (
          <p style={{ color: 'red', marginTop: '10px' }}>
            Error: {state.error}
          </p>
        )}
      </div>

      <div>
        {state.aiResponses.map((recommend, index) => (
          <details 
            key={index} 
            name="recommendation"
            style={{
              marginBottom: '15px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          >
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Recommendation {index + 1} - {recommend.genre} / {recommend.mood} / {recommend.level}
            </summary>
            <div style={{ 
              marginTop: '10px', 
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6' 
            }}>
              {recommend.text}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}



// import React from "react"
// import SelectField from "./components/Select"
// import listOfGenreOption from "./store/genre.json"
// import listOfMoodOption from "./store/mood.json"

// export default function App() {
//   const [genre, setGenre] = React.useState('')
//   const [mood, setMood] = React.useState('')
//   const [level, setLevel] = React.useState('')
//   const [aiResponses, setAiResponses] = React.useState([])

//   const availableMoodBasedOnGenre = listOfMoodOption[genre]
//   const getRecommendation = async () => {
//     setAiResponses([
//       ...aiResponses,
//       `Genre: ${genre}, Mood: ${mood}, and level: ${level}`
//     ])
//   }
//   const fetchRecommendations = async () => {
//   if (!genre || !mood || !level) return;

//   try {
//     const GEMINI_API_KEY = 'AIzaSyAaitFnIuiRbEjr7EcmMq9Ieg5LQJzAs2I'
//     const response = await fetch(
//       "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" +
//       GEMINI_API_KEY,
//       {
//         method:"POST",
//         headers:{"Content-Type":"application/json"},
//         body: JSON.stringify({
//           contents: [{parts:[{text:`Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`}]}]
//         })
//       }
//     );
//     const data = await response.json();
//     console.log(response?.data)
//     setAiResponses([...aiResponses, ...response?.data?.candidates])
//   } catch(err){
//     console.log(err)
//   }
// }

//   return (<section>
//     <SelectField
//       placeholder="Please select a genre"
//       id="genre"
//       options={listOfGenreOption}
//       onSelect={setGenre}
//       value={genre}
//     />

//     <SelectField
//       placeholder="Please select a mood"
//       id="mood"
//       options={availableMoodBasedOnGenre || []}
//       onSelect={setMood}
//     />

//     <SelectField
//       placeholder="Please select a level"
//       id="level"
//       options={['Beginner', "Intermediate", "Expert"]}
//       onSelect={setLevel}
//     />

//     <button onClick={fetchRecommendations}>
//       Get Recommendation
//     </button>

//     <br />
//     <br />
//     {
//       aiResponses.map((recommend, index) => {
//         return (
//           <details key={index} name="recommendation">
//             <summary>Recommendation {index + 1}</summary>
//             <p> {recommend?.content?.[0]?.text}</p>
//           </details>
//         )
//       })
//     }

//   </section>)
// }