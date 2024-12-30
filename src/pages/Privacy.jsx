function Privacy() {
  return (
    <>
      <div className="kontainer flex flex-col items-center justify-center text-white">
        <div className="row">
          <div className="my-8 flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold mb-16">Privacy Notice</h1>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Information Collection</h2>
              <p className="mb-4">
                We collect limited information necessary for game functionality and 
                user experience, including:
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Account information (username, email)</li>
                <li>Game progress and high scores</li>
                <li>Quantum Coin balance and transaction history</li>
                <li>Device and gameplay data for optimization</li>
              </ul>
            </div>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Data Usage</h2>
              <p className="mb-4">Your information is used solely for:</p>
              <ul className="list-disc ml-6 mb-4">
                <li>Managing your game account and progress</li>
                <li>Processing Quantum Coin transactions</li>
                <li>Improving game performance and features</li>
                <li>Sending important game updates and notifications</li>
              </ul>
            </div>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Data Protection</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your personal 
                information, game progress, and Quantum Coin balance from unauthorized access.
              </p>
            </div>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Contact Us</h2>
              <p className="mb-4">
                For privacy-related inquiries, please contact us at <a className="underline font-bold italic" href="mailto:hatemthedev@gmail.com">hatemthedev@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Privacy;