const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-main/10 bg-white/80 py-10 text-gray-600 backdrop-blur-sm">
      <div className="app-shell">
        <div className="flex w-full flex-col justify-between gap-6 text-sm leading-relaxed md:flex-row md:items-end">
          <div className="flex flex-col space-y-2">
            <p className="text-base font-semibold text-gray-800">Team</p>
            <ul className="flex list-none flex-wrap gap-4">
              <li className="transition hover:text-main">최아름</li>
              <li className="transition hover:text-main">박민재</li>
              <li className="transition hover:text-main">이하민</li>
              <li className="transition hover:text-main">김가연</li>
            </ul>
          </div>

          <a
            href="https://github.com/Haleychoioi/sesac-first-project"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-main/40 hover:shadow"
          >
            <img src="/git.png" className="w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
