import LegalPageWrapper from "../components/LegalPageWrapper";
import bgImage from "../assets/qubit-game-bg.png";

function Refund() {
  return (
    <LegalPageWrapper bgImage={bgImage} title="Refund Policy">
      <section>
        <h2 className="text-xl font-semibold mb-4">1. Quantum Coins Policy</h2>
        <p className="mb-6">
          All Quantum Coin purchases are final and non-refundable. This includes coins 
          purchased through any available package options.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">2. Account-Related Issues</h2>
        <p className="mb-4">
          While Quantum Coins themselves are non-refundable, we may address:
        </p>
        <ul className="list-disc ml-6 mb-6 space-y-2">
          <li>Technical issues preventing coin usage</li>
          <li>Account security concerns</li>
          <li>Verification of coin earning achievements</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">3. Contact Process</h2>
        <p className="mb-4">For account-related issues:</p>
        <ol className="list-decimal ml-6 mb-6 space-y-2">
          <li>Email us at <a 
            href="mailto:hatemthedev@gmail.com"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            hatemthedev@gmail.com
          </a></li>
          <li>Include your account details and a detailed explanation of the issue</li>
          <li>Provide any relevant screenshots or documentation</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">4. Important Notes</h2>
        <ul className="list-disc ml-6 mb-6 space-y-2">
          <li>Quantum Coins are strictly non-refundable</li>
          <li>Earned coins through gameplay cannot be converted to real money</li>
          <li>We reserve the right to modify coin-earning mechanisms</li>
          <li>Unauthorized coin transactions may result in account suspension</li>
        </ul>
      </section>
    </LegalPageWrapper>
  );
}

export default Refund;