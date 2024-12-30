function Refund() {
  return (
    <>
      <div className="kontainer flex flex-col items-center justify-center text-white">
        <div className="row">
          <div className="my-8 flex flex-col justify-center items-center">
            <h1 className="text-3xl font-bold mb-16">Refund Policy</h1>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">1. Quantum Coins Policy</h2>
              <p className="mb-4">
                All Quantum Coin purchases are final and non-refundable. This includes coins 
                purchased through any available package options.
              </p>
            </div>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">2. Account-Related Issues</h2>
              <p className="mb-4">
                While Quantum Coins themselves are non-refundable, we may address:
              </p>
              <ul className="list-disc ml-6 mb-4">
                <li>Technical issues preventing coin usage</li>
                <li>Account security concerns</li>
                <li>Verification of coin earning achievements</li>
              </ul>
            </div>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">3. Contact Process</h2>
              <p className="mb-4">For account-related issues:</p>
              <ol className="list-decimal ml-6 mb-4">
                <li>Email us at <a className="underline font-bold italic" href="mailto:hatemthedev@gmail.com">hatemthedev@gmail.com</a></li>
                <li>Include your account details and a detailed explanation of the issue</li>
                <li>Provide any relevant screenshots or documentation</li>
              </ol>
            </div>

            <div className="w-full text-sm mb-6">
              <h2 className="text-xl font-semibold mb-3">4. Important Notes</h2>
              <ul className="list-disc ml-6 mb-4">
                <li>Quantum Coins are strictly non-refundable</li>
                <li>Earned coins through gameplay cannot be converted to real money</li>
                <li>We reserve the right to modify coin-earning mechanisms</li>
                <li>Unauthorized coin transactions may result in account suspension</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Refund;