import LegalPageWrapper from "../components/LegalPageWrapper";
import bgImage from "../assets/qubit-game-bg.png";

function Terms() {
  return (
    <LegalPageWrapper bgImage={bgImage}>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <section>
        <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-6">
          Welcome to QuantumFly (&ldquo;QuantumFly&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). 
          By accessing or using our game and services, you agree to be 
          bound by these Terms of Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">2. Quantum Coins</h2>
        <p className="mb-4">
          Quantum Coins are our virtual currency that can be:
        </p>
        <ul className="list-disc ml-6 mb-6 space-y-2">
          <li>Earned by achieving new high scores on your account</li>
          <li>Purchased through our available packages</li>
          <li>Used to respawn and continue gameplay after losing</li>
          <li>Non-refundable under any circumstances</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">3. Use of Service</h2>
        <p className="mb-6">
          You agree to use QuantumFly only for lawful purposes and in accordance with 
          these Terms. You are responsible for maintaining the security of your account 
          and any Quantum Coins associated with it.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">4. Virtual Currency</h2>
        <p className="mb-6">
          Quantum Coins are a virtual currency with no real-world value. They cannot be 
          transferred, traded, or exchanged for real money. All Quantum Coin purchases 
          are final and non-refundable.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">5. Changes to Terms</h2>
        <p className="mb-6">
          We reserve the right to modify these terms at any time. Continued use of 
          QuantumFly after such modifications constitutes acceptance of the updated terms.
        </p>
      </section>
    </LegalPageWrapper>
  );
}

export default Terms;