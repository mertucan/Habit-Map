import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import './HabitHeatmap.css';

const HabitHeatmap = ({ data }) => {
  const today = new Date();
  
  // Tarihi kaydırmak için yardımcı fonksiyon
  const shiftDate = (date, numDays) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  };

  // Yerel saatte YYYY-AA-GG formatını almak için yardımcı fonksiyon
  const toLocalDateString = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  // Her hücrenin bir tarih değeri olduğundan emin olmak için geçen yılın tüm tarihlerini oluştur
  const getAllDates = () => {
    const dates = [];
    const startDate = shiftDate(today, -364); // 364 gün öncesinden başla
    
    // Bugünü de içeren 365 günü kapsamak için 0'dan 364'e kadar yinele
    for (let i = 0; i <= 364; i++) {
      const currentDate = shiftDate(startDate, i);
      const dateStr = toLocalDateString(currentDate);
      dates.push({
        date: dateStr,
        count: data && data[dateStr] ? data[dateStr] : 0
      });
    }
    return dates;
  };

  const values = getAllDates();

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Saat dilimi sorunlarını önlemek için YYYY-AA-GG'yi manuel olarak ayrıştır
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const monthName = monthNames[localDate.getMonth()];
    const dayNum = localDate.getDate();
    const suffix = getOrdinalSuffix(dayNum);
    
    return `${monthName} ${dayNum}${suffix}`;
  };

  return (
    <div className="heatmap-container">
      <CalendarHeatmap
        startDate={shiftDate(today, -364)}
        endDate={today}
        values={values}
        classForValue={(value) => {
          if (!value || value.count === 0) {
            return 'color-empty';
          }
          return `color-github-${Math.min(value.count, 4)}`;
        }}
        tooltipDataAttrs={value => {
          let tooltipText = '';
          
          if (value && value.date) {
            const dateFormatted = formatDate(value.date);
            const count = value.count || 0;
            
            if (count === 0) {
                tooltipText = `No activity on ${dateFormatted}`;
            } else {
                tooltipText = `${count} activities on ${dateFormatted}`;
            }
          }
          
          return {
            'data-tooltip-id': 'heatmap-tooltip',
            'data-tooltip-content': tooltipText,
          };
        }}
        showWeekdayLabels
        gutterSize={2}
      />
      <Tooltip id="heatmap-tooltip" style={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', zIndex: 50 }} />
    </div>
  );
};

export default HabitHeatmap;
