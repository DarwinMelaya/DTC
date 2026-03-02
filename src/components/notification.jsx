const Notification = ({ message, type }) => {
    if (!message) return null;
  
    return (
      <div
        className={`fixed left-4 top-4 p-4 bg-${type}-500 text-white rounded-md shadow-md`}
      >
        {message}
      </div>
    );
  };
  