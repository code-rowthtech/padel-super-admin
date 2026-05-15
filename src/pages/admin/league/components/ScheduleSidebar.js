import React from 'react';
import { Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BiExport } from 'react-icons/bi';
import { exportLeagueSchedulesPDF } from '../../../../redux/admin/league/thunk';
import { useDispatch } from 'react-redux';

const ScheduleSidebar = ({
  loadingSummary,
  loadingScheduleDates,
  scheduleDates,
  leagueSummary,
  selectedScheduleDate,
  loadingExport,
  onDateSelection,
  leagueId,
  setSelectedRound
}) => {
  const dispatch = useDispatch();
  return (
    <Col md={2} className='d-flex flex-column border-end' style={{ backgroundColor: '#FBFCFE', padding: '16px', gap: '12px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span style={{ fontWeight: '700', color: '#1a1a1a', fontSize: '15px' }}>Summary</span>
      </div>

      {loadingSummary || loadingScheduleDates ? (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary"></div>
        </div>
      ) : (
        <>
          {scheduleDates?.length > 0 && (
            <div className="mb-3">
              <div className='mb-2' style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Final Countdown</div>
              <div className="d-flex flex-column gap-2">
                {scheduleDates.map((dateItem, idx) => {
                  const finalDate = new Date(dateItem.date);
                  const daysLeft = Math.ceil((finalDate.getTime() - Date.now()) / (1000 * 3600 * 24));
                  const isToday = daysLeft === 0;
                  const isPast = daysLeft < 0;
                  const isSelected = selectedScheduleDate === dateItem.date;
                  return (
                    <div
                      key={idx}
                      className='border rounded-3'
                      onClick={() => {
                        onDateSelection(dateItem.date);
                        setSelectedRound('final')
                      }}
                      style={{
                        background: isSelected ? 'rgba(31, 65, 187, 0.1)' : isPast ? 'rgba(248, 249, 250, 1)' : isToday ? 'rgba(255, 243, 205, 1)' : 'rgba(232, 244, 253, 1)',
                        padding: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
                        border: isSelected ? '2px solid #1F41BB' : isToday ? '2px solid #ffc107' : '1px solid #dee2e6'
                      }}
                      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'; } }}
                      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}
                    >
                      <div className='mb-2'>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                          {finalDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-center mb-2">
                        {isPast ? (
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#6c757d' }}>Final Completed</div>
                        ) : isToday ? (
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#ff6b35' }}>🔥 TODAY!</div>
                        ) : (
                          <div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#1F41BB' }}>{daysLeft}</div>
                            <div style={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>{daysLeft === 1 ? 'day left' : 'days left'}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {leagueSummary?.byDate?.length > 0 ? (
            <div className="mb-3">
              <div className='mb-2' style={{ fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>By Date</div>
              <div className="d-flex flex-column gap-2">
                {leagueSummary.byDate.map((item, idx) => {
                  const isSelected = selectedScheduleDate === item.date;
                  return (
                    <div
                      key={idx}
                      className='border rounded-3'
                      onClick={() => onDateSelection(item.date)}
                      style={{
                        background: isSelected ? 'rgba(31, 65, 187, 0.1)' : 'rgba(251, 252, 254, 1)',
                        padding: '12px', textAlign: 'center', cursor: 'pointer',
                        transition: 'all 0.2s ease', position: 'relative',
                        border: isSelected ? '2px solid #1F41BB' : '1px solid #dee2e6'
                      }}
                      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'; } }}
                      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: '#1F41BB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white', fontWeight: 'bold' }}>✓</div>
                      )}
                      <div className='d-flex justify-content-between align-items-center gap-2 mb-2'>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>
                          {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Export Schedule</Tooltip>}
                        >
                          <div
                            onClick={e => {
                              e.stopPropagation();
                              dispatch(exportLeagueSchedulesPDF({ leagueId: leagueId, startDate: item.date, endDate: item.date }))
                            }}
                            style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'rgba(31, 65, 187, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: loadingExport ? 'not-allowed' : 'pointer', opacity: loadingExport ? 0.6 : 1, pointerEvents: loadingExport ? 'none' : 'auto' }}
                          >
                            <BiExport size={14} />
                          </div>
                        </OverlayTrigger>
                      </div>
                      <div className="d-flex justify-content-between align-items-center text-start">
                        <div className='mb-1 text-start' style={{ fontSize: '12px', color: '#666' }}>
                          <p className='mb-0'>Matches: {String(item.matchCount).padStart(2, '0')}</p>
                        </div>
                        <div className='mb-1 text-end' style={{ fontSize: '12px', color: '#666' }}>
                          <p className='mb-0'>
                            {item?.venues?.map(v => v?.venueName).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className='h-100 d-flex align-items-center justify-content-center'>
              <p>No data found</p>
            </div>
          )}
        </>
      )}
    </Col>
  );
};

export default ScheduleSidebar;
