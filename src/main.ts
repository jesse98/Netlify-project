import './styles.css';
import { mountAskTwin } from './ask-twin';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAskTwin, { once: true });
} else {
  mountAskTwin();
}
