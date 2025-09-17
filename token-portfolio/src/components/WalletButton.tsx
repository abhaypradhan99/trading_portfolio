import { ConnectButton } from '@rainbow-me/rainbowkit';
import wallet from "../assets/wallet.svg";
const WalletButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {(() => {
              if (!connected) {
                return (
               <button 
                onClick={openConnectModal} 
                style={{ backgroundColor: "#A9E851", borderRadius: 26 }} 
                className="bg-accent text-black text-sm sm:text-base rounded-md hover:opacity-90 w-full sm:w-auto"
              >
              <img 
                src={wallet} 
                alt="wallet" 
                className="inline-block w-4 h-4 sm:w-6 sm:h-6 mr-2" 
              />

              <span className="text-sm sm:text-base align-middle">Connect Wallet</span>
              </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} className="bg-red-500 px-4 py-2 rounded-md w-full sm:w-auto">
                    Wrong network
                  </button>
                );
              }
              return (
                <button onClick={openAccountModal} className="bg-accent text-black px-4 py-2 rounded-md w-full sm:w-auto">
                  {account.displayName}
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletButton;
