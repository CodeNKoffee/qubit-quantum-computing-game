import LegalPageWrapper from "../components/LegalPageWrapper";

function Privacy() {
  return (
    <LegalPageWrapper title="Privacy Notice">
      <section>
        <h2 className="text-xl font-semibold mb-4">1. Information Collection</h2>
        <p className="mb-4">
          We collect limited information necessary for game functionality and 
          user experience, including:
        </p>
        <ul className="list-disc ml-6 mb-6 space-y-2">
          <li>Account information (username, email)</li>
          <li>Game progress and high scores</li>
          <li>Quantum Coin balance and transaction history</li>
          <li>Device and gameplay data for optimization</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">2. Data Usage</h2>
        <p className="mb-4">Your information is used solely for:</p>
        <ul className="list-disc ml-6 mb-6 space-y-2">
          <li>Managing your game account and progress</li>
          <li>Processing Quantum Coin transactions</li>
          <li>Improving game performance and features</li>
          <li>Sending important game updates and notifications</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">3. Data Protection</h2>
        <p className="mb-6">
          We implement appropriate security measures to protect your personal 
          information, game progress, and Quantum Coin balance from unauthorized access.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">4. Contact Us</h2>
        <p className="mb-6">
          For privacy-related inquiries, please contact us at{" "}
          <a 
            href="mailto:hatemthedev@gmail.com"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            hatemthedev@gmail.com
          </a>
        </p>
      </section>
    </LegalPageWrapper>
  );
}

export default Privacy;