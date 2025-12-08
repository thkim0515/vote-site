export default function PageContainer({ children }) {
  return (
    <div
      style={{
        maxWidth: "600px",      
        margin: "0 auto",       
        padding: "16px",        
        minHeight: "100vh",     
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}
