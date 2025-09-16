import { ConnectButton } from '@rainbow-me/rainbowkit';

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
                 <button onClick={openConnectModal} style={{backgroundColor:"#A9E851"}} className="bg-accent text-black px-4 py-2 rounded-md hover:opacity-90">
  Connect Wallet
</button>

                );
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} className="bg-red-500 px-4 py-2 rounded-md">
                    Wrong network
                  </button>
                );
              }
              return (
                <button onClick={openAccountModal} className="bg-accent text-black px-4 py-2 rounded-md">
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