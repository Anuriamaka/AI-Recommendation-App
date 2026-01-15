import React from "react"
import SelectField from "./components/Select"
import listOfGenreOption from "./store/genre.json"
import listOfMoodOption from "./store/mood.json"

export default function App() {
  const [genre, setGenre] = React.useState('')
  const [mood, setMood] = React.useState('')
  const [level, setLevel] = React.useState('')
  const [aiResponses, setAiResponses] = React.useState([])

  const availableMoodBasedOnGenre = listOfMoodOption[genre]
  const getRecommendation = async () => {
    setAiResponses([
      ...aiResponses,
      `Genre: ${genre}, Mood: ${mood}, and level: ${level}`
    ])
  }
  const fetchRecommendations = async () => {
  if (!genre || !mood || !level) return;

  try {
    const GEMINI_API_KEY = 'AIzaSyAaitFnIuiRbEjr7EcmMq9Ieg5LQJzAs2I'
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" +
      GEMINI_API_KEY,
      {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          contents: [{parts:[{text:`Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`}]}]
        })
      }
    );
    const data = await response.json();
    console.log(response?.data)
    setAiResponses([...aiResponses, ...response?.data?.candidates])
  } catch(err){
    console.log(err)
  }
}

  return (<section>
    <SelectField
      placeholder="Please select a genre"
      id="genre"
      options={listOfGenreOption}
      onSelect={setGenre}
      value={genre}
    />

    <SelectField
      placeholder="Please select a mood"
      id="mood"
      options={availableMoodBasedOnGenre || []}
      onSelect={setMood}
    />

    <SelectField
      placeholder="Please select a level"
      id="level"
      options={['Beginner', "Intermediate", "Expert"]}
      onSelect={setLevel}
    />

    <button onClick={fetchRecommendations}>
      Get Recommendation
    </button>

    <br />
    <br />
    {
      aiResponses.map((recommend, index) => {
        return (
          <details key={index} name="recommendation">
            <summary>Recommendation {index + 1}</summary>
            <p> {recommend?.content?.[0]?.text}</p>
          </details>
        )
      })
    }

  </section>)
}