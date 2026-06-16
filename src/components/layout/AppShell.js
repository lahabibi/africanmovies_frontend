import Header from './Header';
import { currentUser } from '../../data/sessionData';

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Header currentUser={currentUser} />
      {children}
    </div>
  );
}

export default AppShell;
