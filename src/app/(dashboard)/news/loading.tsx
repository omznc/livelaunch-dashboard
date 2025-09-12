import { ImSpinner3 } from 'react-icons/im';

export default function Loading() {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <ImSpinner3 className="animate-spin w-12 h-12" />
    </div>
  );
}
