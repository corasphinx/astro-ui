import cn from 'classnames';
import { forwardRef } from 'react';

import styles from './SenderIcon.module.scss';

interface NearIconProps {
  black?: boolean;
  className?: string;
  onClick?: () => void;
  showLoader?: boolean;
}

export const SenderIcon = forwardRef<SVGSVGElement, NearIconProps>(
  (props, ref) => {
    const { black, className, onClick, showLoader } = props;

    const rootClassName = cn(styles.root, className, {
      [styles.black]: black,
      [styles.loading]: showLoader,
    });

    return (
      <svg
        ref={ref}
        width="38"
        height="38"
        fill="none"
        viewBox="0 0 38 38"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        className={rootClassName}
      >
        <circle cx="19" cy="19" r="18.5" className={styles.circle} />
        <path
          className={styles.icon}
          d="M17.2017 32.7132L16.8645 32.4883L21.3615 25.4055C22.4858 23.4943 22.0361 21.0209 20.1248 19.8966L17.7639 18.3227C15.7402 16.9736 15.0657 14.3878 16.3023 12.2517L20.3497 5.28125L20.687 5.5061L16.6396 12.4765C15.5154 14.3878 16.0775 16.7487 17.9887 17.873L20.3497 19.4469C22.3733 20.796 23.0479 23.4943 21.6988 25.6304L17.2017 32.7132Z"
          fill="black"
        />
        <path
          className={styles.icon}
          d="M17.9879 33.0527C17.6506 33.0527 17.3134 32.9402 16.9761 32.7154C16.0767 32.1532 15.7394 30.9166 16.414 30.0172L20.0116 24.3959C20.6862 23.384 20.3489 21.9225 19.337 21.2479L16.9761 19.674C14.1654 17.8751 13.266 14.1651 14.9524 11.242L18.1004 5.84556C18.3252 5.39585 18.7749 5.05857 19.337 4.94615C19.8992 4.83372 20.3489 4.83372 20.7986 5.171C21.2483 5.39585 21.5856 5.84556 21.698 6.40769C21.8104 6.96982 21.698 7.41952 21.4731 7.86922L18.3252 13.2657C17.6507 14.3899 17.9879 15.739 19.1122 16.4136L21.4731 17.9876C24.2838 19.7864 25.1832 23.6089 23.3844 26.5319L19.7867 32.1532C19.2246 32.7154 18.6625 33.0527 17.9879 33.0527ZM19.6743 5.39585C19.5619 5.39585 19.4495 5.39585 19.337 5.39585C18.9998 5.50828 18.6625 5.73313 18.4376 6.07041L15.2897 11.4669C13.7157 14.1651 14.5027 17.5379 17.0885 19.2242L19.4495 20.7982C20.6862 21.5852 21.1359 23.2716 20.2364 24.6207L16.6388 30.242C16.1891 30.9166 16.414 31.9284 17.0885 32.3781C17.7631 32.8278 18.7749 32.6029 19.2246 31.9284L22.7098 26.3071C24.3962 23.6089 23.6092 20.1237 20.911 18.3248L18.5501 16.7509C17.3134 15.9639 16.8637 14.2775 17.6506 13.0408L20.7986 7.64437C21.2483 6.96982 21.0234 5.95798 20.2364 5.6207C20.2364 5.50827 19.8992 5.39585 19.6743 5.39585Z"
          fill="black"
        />
      </svg>
    );
  }
);
