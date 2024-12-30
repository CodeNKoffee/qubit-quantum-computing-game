function Terms() {
  return (
    <>
      <div className="kontainer flex flex-col items-center justify-center text-white">
        <div className="row">
          <div className="my-8 flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold mb-16">Terms of Services</h1>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="mb-4">
                Welcome to QuantumFly (&quot;QuantumFly&quot;, &quot;we&quot;, &quot;us&quot;, 
                or &quot;our&quot;). By accessing or using our game and services, you agree to be 
                bound by these Terms of Service.
              </p>
            </div>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Quantum Coins</h2>
              <p className="mb-4">
                Quantum Coins are our virtual currency that can be:
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Earned by achieving new high scores on your account</li>
                <li>Purchased through our available packages</li>
                <li>Used to respawn and continue gameplay after losing</li>
                <li>Non-refundable under any circumstances</li>
              </ul>
            </div>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Use of Service</h2>
              <p className="mb-4">
                You agree to use QuantumFly only for lawful purposes and in accordance with 
                these Terms. You are responsible for maintaining the security of your account 
                and any Quantum Coins associated with it.
              </p>
            </div>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Virtual Currency</h2>
              <p className="mb-4">
                Quantum Coins are a virtual currency with no real-world value. They cannot be 
                transferred, traded, or exchanged for real money. All Quantum Coin purchases 
                are final and non-refundable.
              </p>
            </div>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">5. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. Continued use of 
                QuantumFly after such modifications constitutes acceptance of the updated terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Terms;