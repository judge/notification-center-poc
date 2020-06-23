const source = new EventSource('http://localhost:5000/subscribeToEvents');

source.addEventListener('notification', event => {
  const data = JSON.parse(event.data);

  window.e.utils.openNotification({
    title: 'Notification',
    content: data.content,
    autoClose: true
  });
});
