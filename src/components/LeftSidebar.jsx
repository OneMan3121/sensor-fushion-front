import React from 'react';
import { Home, BarChart3, Users, Settings, ChevronLeft } from 'lucide-react';
import styles from './LeftSidebar.module.css';

const LeftSidebar = ({ open }) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '#' },
    { icon: BarChart3, label: 'Analytics', href: '#' },
    { icon: Users, label: 'Users', href: '#' },
    { icon: Settings, label: 'Settings', href: '#' },
  ];

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : styles.collapsed}`}>
      <nav className={styles.nav}>
        {menuItems.map((item, index) => (
          <a key={index} href={item.href} className={styles.navItem}>
            <item.icon size={20} />
            {open && <span className={styles.label}>{item.label}</span>}
          </a>
        ))}
      </nav>
      {open && (
        <button className={styles.collapseBtn}>
          <ChevronLeft size={16} />
        </button>
      )}
    </aside>
  );
};

export default LeftSidebar;
