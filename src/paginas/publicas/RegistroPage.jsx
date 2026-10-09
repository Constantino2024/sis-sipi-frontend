import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import RegistroForm from '../../components/forms/RegistroForm';

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <RegistroForm />
      </main>
      <Footer />
    </div>
  );
}