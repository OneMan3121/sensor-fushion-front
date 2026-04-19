import React from 'react';
import { Bell, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import styles from './RightSidebar.module.css';

const RightSidebar = ({ open }) => {
  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : styles.collapsed}`}>
      <div className={styles.content}>
        <h3 className={styles.title}>Notifications</h3>
        <div className={styles.notifications}>
          <div className={styles.notification}>
            <Bell size={16} />
            <span>New message received</span>
          </div>
          <div className={styles.notification}>
            <MessageSquare size={16} />
            <span>Comment on your post</span>
          </div>
          <div className={styles.notification}>
            <Calendar size={16} />
            <span>Meeting reminder</span>
          </div>
        </div>
      </div>
      {open && (
        <button className={styles.collapseBtn}>
          <ChevronRight size={16} />
        </button>
      )}
    </aside>
  );
};

export default RightSidebar;
