// import { useMemo, useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
// import MonoConnect from "@mono.co/connect.js";
// function App() {
//   const customer = {
//     name: "Samuel Olumide",
//     email: "samuel.olumide@gmail.com",
//     identity: {
//       type: "bvn",
//       number: "2323233239",
//     },
//   };

//   const monoConnect = useMemo(() => {
//     const monoInstance = new MonoConnect({
//       onClose: () => console.log("Widget closed"),
//       onLoad: () => console.log("Widget loaded successfully"),
//       onSuccess: ({ code }: any) => console.log(`Linked successfully: ${code}`),
//       key: "test_pk_m0x4g82zhz3ftaz9khaq",
//       scope: "balance",
//       data: { customer },
//     });

//     monoInstance.setup();

//     return monoInstance;
//   }, []);
//   return (
//     <>
//       <button onClick={() => monoConnect.open()}>Link account with Mono</button>
//     </>
//   );
// }

// export default App;

import { useMemo, useState } from "react";
import "./App.css";
import MonoConnect from "@mono.co/connect.js";

function App() {
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const customer = {
    name: "Samuel Olumide",
    email: "samuel.olumide@gmail.com",
    identity: {
      type: "bvn",
      number: "2323233239",
    },
  };

  const monoConnect = useMemo(() => {
    const monoInstance = new MonoConnect({
      onClose: () => console.log("Widget closed"),
      onLoad: () => console.log("Widget loaded successfully"),
      onSuccess: async ({ code }: any) => {
        try {
          setLoading(true);
          const response = await fetch("http://localhost:3001/api/auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          });
          const data = await response.json();

          if (data.status === "processing") {
            // Handle processing state
            console.log(data.message);
            return;
          }

          setAccountInfo(data);
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setLoading(false);
        }
      },
      // });
      //       console.error("Error fetching account info:", error);
      //     } finally {
      //       setLoading(false);
      //     }
      //   },
      key: "test_pk_m0x4g82zhz3ftaz9khaq",
      //   scope: "balance",
      data: { customer },
    });

    monoInstance.setup();
    return monoInstance;
  }, []);

  return (
    <div className="p-6">
      {!accountInfo && (
        <button
          onClick={() => monoConnect.open()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm"
        >
          Link account with Mono
        </button>
      )}

      {loading && (
        <p className="mt-4 text-gray-600">Loading account information...</p>
      )}

      {accountInfo && (
        <div className="mt-4 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
            {JSON.stringify(accountInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
