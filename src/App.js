import Runner from './Holistic'
import TestSupport from './mobile-detection'

function App() {
  TestSupport()
  return (
    <div className="App">
      <header className="App-header">
          <Runner />
      </header>
    </div>
  );
}

export default App;
