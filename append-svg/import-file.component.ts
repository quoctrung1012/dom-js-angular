/**
 *
 * - Component: "app-icon-svg"
 * - Giao diện app để import svg
 * - Yêu cầu phải display:none, thẻ "symbol" có "id"(id gọi khi view), "viewBox"(viewBox của svg).
 * - Giá trị của fill (stroke) toàn bộ chuyển sang "currentColor"
 * ===============================================================================================
 * - Component: "app-view-svg"
 * - Giao diện như bên dưới, class: shape là kích thước svg muốn hiển thị và thây đổi màu bằng cách dùng color.
 * */
@Component({
  selector: 'app-icon-svg',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" style="display:none">
    <symbol id="ico-search" viewBox="0 0 512 512">
        <path d="M221.09 64a157.09 157.09 0 10157.09 157.09A157.1 157.1 0 00221.09 64z" fill="none"
            stroke="currentColor" stroke-miterlimit="10" stroke-width="32" />
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32"
            d="M338.29 338.29L448 448" />
    </symbol>
    <symbol id="ico-home" viewBox="0 0 512 512">
        <path d="M80 212v236a16 16 0 0016 16h96V328a24 24 0 0124-24h80a24 24 0 0124 24v136h96a16 16 0 0016-16V212"
            fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" />
        <path d="M480 256L266.89 52c-5-5.28-16.69-5.34-21.78 0L32 256M400 179V64h-48v69" fill="none"
            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" />
    </symbol>
    <symbol id="ico-user" viewBox="0 0 512 512">
        <path d="M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96z" fill="none"
            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" />
        <path
            d="M256 304c-87 0-175.3 48-191.64 138.6C62.39 453.52 68.57 464 80 464h352c11.44 0 17.62-10.48 15.65-21.4C431.3 352 343 304 256 304z"
            fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" />
    </symbol>
    <symbol id="ico-arrow-down" viewBox="0 0 512 512">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48"
            d="M112 184l144 144 144-144" />
    </symbol>
    <symbol id="ico-arrow-up" viewBox="0 0 512 512">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48"
            d="M112 328l144-144 144 144" />
    </symbol>
    <symbol id="ico-arrow-prev" viewBox="0 0 512 512">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48"
            d="M328 112L184 256l144 144" />
    </symbol>
    <symbol id="ico-arrow-next" viewBox="0 0 512 512">
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48"
            d="M184 112l144 144-144 144" />
    </symbol>
    <symbol id="ico-dropdown" viewBox="0 0 10 5">
        <path d="M0.962483 0.38096L5.25321 4.67169L9.54395 0.38096" fill="currentColor" />
    </symbol>
    <symbol id="ico-signin" viewBox="0 0 23 23">
        <path
            d="M11.5 0C8.45098 0.00315098 5.52774 1.21576 3.37175 3.37175C1.21577 5.52773 0.00315098 8.45096 0 11.5C0 14.5726 1.1954 17.46 3.36685 19.6314C4.43234 20.7029 5.69983 21.5524 7.09591 22.1306C8.49199 22.7088 9.98892 23.0043 11.5 23C14.549 22.9968 17.4723 21.7842 19.6282 19.6282C21.7842 17.4722 22.9968 14.549 23 11.5C22.9968 8.45096 21.7842 5.52773 19.6282 3.37175C17.4723 1.21576 14.549 0.00315098 11.5 0ZM4.54865 19.5566C5.34347 18.5225 6.36155 17.6813 7.52692 17.0957C8.69229 16.51 9.97486 16.1951 11.2789 16.1744C11.3198 16.1761 11.3589 16.1863 11.3997 16.1863H11.4388C11.4762 16.1863 11.5102 16.1761 11.5476 16.1744C12.8697 16.1969 14.1691 16.5222 15.3459 17.1254C16.5226 17.7285 17.5454 18.5933 18.3357 19.6535C16.4237 21.2672 14.002 22.1515 11.5 22.1497C8.94556 22.1543 6.47599 21.2331 4.54865 19.5566ZM11.4048 15.3157C11.3623 15.3157 11.3215 15.3225 11.2789 15.3242C10.2864 15.2906 9.34615 14.8712 8.65803 14.1551C7.96992 13.4391 7.58823 12.4829 7.59412 11.4898C7.59589 10.9871 7.69689 10.4897 7.89132 10.0261C8.08576 9.56255 8.36979 9.14192 8.72714 8.78837C9.08449 8.43481 9.50812 8.15528 9.97374 7.9658C10.4394 7.77633 10.9378 7.68064 11.4405 7.68422C11.9432 7.686 12.4406 7.787 12.9041 7.98143C13.3677 8.17586 13.7883 8.4599 14.1419 8.81724C14.4955 9.17459 14.775 9.59822 14.9645 10.0638C15.1539 10.5295 15.2496 11.0279 15.246 11.5306C15.246 13.5915 13.5966 15.2664 11.5493 15.3259C11.5017 15.3242 11.4541 15.3157 11.4048 15.3157ZM18.9666 19.0822C17.6517 17.347 15.7815 16.1154 13.668 15.5929C14.4035 15.1899 15.0169 14.5965 15.4442 13.8749C15.8714 13.1533 16.0966 12.3301 16.0963 11.4915C16.0943 10.8772 15.9711 10.2693 15.7339 9.70273C15.4966 9.13611 15.15 8.62184 14.7137 8.18938C14.2775 7.75692 13.7602 7.41475 13.1915 7.18247C12.6228 6.95019 12.0139 6.83235 11.3997 6.83571C10.7854 6.83771 10.1775 6.96086 9.61092 7.1981C9.0443 7.43533 8.53004 7.782 8.09758 8.21825C7.66511 8.65451 7.32295 9.17177 7.09066 9.74044C6.85838 10.3091 6.74054 10.918 6.7439 11.5323C6.74702 12.363 6.97303 13.1778 7.39835 13.8914C7.82366 14.605 8.4327 15.1915 9.16191 15.5895C7.08416 16.0998 5.23871 17.2948 3.92289 18.9818C1.94931 16.994 0.844877 14.3045 0.851915 11.5034C0.855065 8.67985 1.97811 5.97287 3.97464 3.97634C5.97118 1.9798 8.67817 0.856764 11.5017 0.853614C14.3252 0.856764 17.0322 1.9798 19.0288 3.97634C21.0253 5.97287 22.1483 8.67985 22.1515 11.5034C22.1508 12.9149 21.8687 14.3121 21.3219 15.6134C20.7751 16.9146 19.9744 18.0939 18.9666 19.0822Z"
            fill="currentColor" />
    </symbol>
    <symbol id="ico-app" viewBox="0 0 25 25">
        <rect x="3.625" y="3.20898" width="7" height="7" rx="1" stroke-width="1.5" stroke-linecap="round" class="icon"
            fill="currentColor"></rect>
        <rect x="3.625" y="14.209" width="7" height="7" rx="1" stroke-width="1.5" stroke-linecap="round" class="icon"
            fill="currentColor"></rect>
        <rect x="14.625" y="3.20898" width="7" height="7" rx="1" stroke-width="1.5" stroke-linecap="round" class="icon"
            fill="currentColor"></rect>
        <rect x="14.625" y="14.209" width="7" height="7" rx="1" stroke-width="1.5" stroke-linecap="round" class="icon"
            fill="currentColor"></rect>
    </symbol>
    <symbol id="ico-play" viewBox="0 0 512 512">
        <path
            d="M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z"
            fill="currentColor" />
    </symbol>
    <symbol id="ico-clock" viewBox="0 0 512 512">
        <path d="M256 64C150 64 64 150 64 256s86 192 192 192 192-86 192-192S362 64 256 64z" fill="none"
            stroke="currentColor" stroke-miterlimit="10" stroke-width="32" />
        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"
            d="M256 128v144h96" />
    </symbol>
</svg>
  `,
});
@Component({
  selector: 'app-view-svg',
  template: `
  <div class="shape">
            <svg>
              <use xlink:href="#ico-dropdown"></use>
            </svg>
          </div>
  `,
});

