import React from 'react';
import { X } from 'lucide-react';
import styles from './MobileDrawer.module.css';

const MobileDrawer = ({ side, close }) => {
  const isLeft = side === 'left';

  return (
    <>
      <div className={styles.overlay} onClick={close}></div>
      <div className={`${styles.drawer} ${isLeft ? styles.left : styles.right}`}>
        <div className={styles.header}>
          <h3>{isLeft ? 'Menu' : 'Notifications'}</h3>
          <button className={styles.closeBtn} onClick={close}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.content}>
          {isLeft ? (
            <nav>
              <a href="#" className={styles.navItem}>Dashboard</a>
              <a href="#" className={styles.navItem}>Analytics</a>
              <a href="#" className={styles.navItem}>Users</a>
              <a href="#" className={styles.navItem}>Settings</a>
            </nav>
          ) : (
            <div>
              <div className={styles.notification}>
                <span>New message received</span>
              </div>
              <div className={styles.notification}>
                <span>Comment on your post</span>
              </div>
              <div className={styles.notification}>
                <span>Meeting reminder</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
