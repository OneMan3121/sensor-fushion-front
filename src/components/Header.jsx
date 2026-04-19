import React from 'react';
import { Menu, Settings, Bell, User, Sidebar } from 'lucide-react';
import styles from './Header.module.css';

const Header = ({ toggleLeft, toggleRight, openMobileDrawer }) => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={() => openMobileDrawer('left')}>
          <Menu size={20} />
        </button>
        <button className={`${styles.toggleBtn} ${styles.desktopOnly}`} onClick={toggleLeft}>
          <Sidebar size={20} />
        </button>
        <h1 className={styles.title}>Dashboard</h1>
      </div>
      <div className={styles.right}>
        <button className={`${styles.toggleBtn} ${styles.desktopOnly}`} onClick={toggleRight}>
          <Sidebar size={20} />
        </button>
        <button className={styles.iconBtn} onClick={() => openMobileDrawer('right')}>
          <Bell size={20} />
        </button>
        <button className={styles.iconBtn}>
          <Settings size={20} />
        </button>
        <button className={styles.iconBtn}>
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
