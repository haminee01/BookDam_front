// src/components/mypage/ParticipatingCommunityCard.tsx

import { Link } from "react-router-dom";
import Button from "../common/Button";
import { FaUserFriends } from "react-icons/fa";

import type { Community } from "../../types";

interface ParticipatingCommunityCardProps {
  community: Community;
  onLeaveOrDelete: (communityId: string, role: "host" | "member") => void;
}

const ParticipatingCommunityCard: React.FC<ParticipatingCommunityCardProps> = ({
  community,

  onLeaveOrDelete,
}) => {
  const isHost = community.role === "host";

  return (
    <div className="bg-gray-100 p-6 flex flex-col justify-between">
      <div className="flex flex-col items-start mb-14">
        <div className="flex items-center justify-between w-full">
          <div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {community.title}
              </h3>
            </div>
            <p className="text-md text-gray-600 mb-4">
              {isHost && <span className="font-medium mr-1">호스트: </span>}
              {community.hostName}
            </p>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <FaUserFriends className="w-5 h-5 mr-1 text-gray-500" />
            <span>{community.currentMembers}명</span>
          </div>
        </div>

        <hr className="border-t border-gray-300 w-full mb-4" />
        <div>
          <p className="text-gray-700 text-md font-light leading-relaxed">
            {community.description}
          </p>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex space-x-2 justify-between items-center">
          <Link to={`/communities/${community.id}/posts`}>
            <Button
              bgColor="bg-main"
              textColor="text-white"
              hoverBgColor="hover:bg-apply"
              className="w-full px-3 py-2 text-sm flex-1"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              게시판 가기
            </Button>
          </Link>

          <Button
            onClick={(e) => {
              e.preventDefault();

              onLeaveOrDelete(community.id, community.role);
            }}
            bgColor="bg-gray-300"
            textColor="text-gray-800"
            hoverBgColor="hover:bg-gray-400"
            className="flex-1 px-3 py-2 text-sm"
          >
            {isHost ? "삭제" : "나가기"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParticipatingCommunityCard;
