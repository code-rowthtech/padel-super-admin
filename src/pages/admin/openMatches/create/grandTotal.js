const grandTotal = React.useMemo(() => {
  let total = 0;
  const dateKey = selectedDate?.fullDate;
  const processedSlots = new Set();

  selectedCourts.forEach(court => {
    if (court.date === dateKey) {
      court.time.forEach(slot => {
        const slotKey = `${court._id}-${slot._id}`;
        if (!processedSlots.has(slotKey)) {
          processedSlots.add(slotKey);
          
          let slotDuration = 60;
          const leftKey = `${court._id}-${slot._id}-${dateKey}-left`;
          const rightKey = `${court._id}-${slot._id}-${dateKey}-right`;
          const hasLeft = halfSelectedSlots.has(leftKey);
          const hasRight = halfSelectedSlots.has(rightKey);
          
          if (hasLeft || hasRight) {
            slotDuration = (hasLeft && hasRight) ? 60 : 30;
          }
          
          const slotPrice = getPriceForSlotWrapper(slot.time, selectedDate?.day, false, court._id, slotDuration);
          total += slotPrice || 0;
        }
      });
    }
  });

  const halfSlotMap = new Map();
  Array.from(halfSelectedSlots).forEach(key => {
    if (key.includes(dateKey)) {
      const parts = key.split('-');
      const side = parts[parts.length - 1];
      const courtId = parts[0];
      const slotId = parts[1];
      const groupKey = `${courtId}-${slotId}`;

      if (processedSlots.has(groupKey)) {
        return;
      }

      if (!halfSlotMap.has(groupKey)) {
        halfSlotMap.set(groupKey, { left: false, right: false, courtId, slotId });
      }
      const group = halfSlotMap.get(groupKey);
      if (side === 'left') group.left = true;
      if (side === 'right') group.right = true;
    }
  });

  halfSlotMap.forEach(group => {
    const court = slotData?.data?.find(c => c._id === group.courtId);
    const slot = court?.slots?.find(s => s._id === group.slotId);

    if (slot) {
      const slotDuration = group.left && group.right ? 60 : 30;
      const slotPrice = getPriceForSlotWrapper(slot.time, selectedDate?.day, false, group.courtId, slotDuration);
      total += slotPrice || 0;
    }
  });

  return total;
}, [halfSelectedSlots, selectedCourts, slotData, selectedDate?.day, selectedDate?.fullDate, getPriceForSlotWrapper]);
