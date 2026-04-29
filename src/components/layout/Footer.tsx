const Footer: React.FC = () => {
  return (
    <footer className=" text-gray-600 py-12">
      <div className="container mx-auto px-4 flex flex-col items-center mb-16">
        <hr className="border-t border-gray-300 w-full mb-8" />
        <div className="flex justify-between items-end w-full max-w-5xl text-sm leading-relaxed">
          <div className="flex flex-col space-y-2">
            <p className="text-base font-semibold text-gray-800">Team</p>
            <ul className="list-none space-x-4 flex">
              <li className="hover:text-main">최아름</li>
              <li className="hover:text-main">박민재</li>
              <li className="hover:text-main">이하민</li>
              <li className="hover:text-main">김가연</li>
            </ul>
          </div>

          <a
            href="https://github.com/Haleychoioi/sesac-first-project"
            target="_blank"
          >
            <img src="/git.png" className="w-10" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
