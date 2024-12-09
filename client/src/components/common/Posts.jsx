import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { baseUrl } from "../../constant/url"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react";
const Posts = ({ feedType,username,userid }) => {
	const getEndPoint = () => {
		switch (feedType) {
			case "forYou":
				return `${baseUrl}/api/post/getPost`
			case "following":
				return `${baseUrl}/api/post/getfollowedpost`
			case "likes":
				return `${baseUrl}/api/post/getliked/${userid}`
			case "posts":
				return `${baseUrl}/api/post/userpost/${username}`
			default:
				return `${baseUrl}/api/post/getPost`
		}
	}
	const POST_ENDPOINT = getEndPoint()
	const { isLoading, data: post, isRefetching, refetch } = useQuery({
		queryKey: ["post"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT, {
					method: "GET",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					}
				})
				const data = await res.json()
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong")
				}
				return data
			} catch (error) {
				throw error
			}
		}
	})
	useEffect(() => {
		refetch()
	}, [feedType, refetch,username])
	return (
		<div style={{marginBottom:"55px"}} className=" sm:mb-[0px] lg:mb-[0px] md:mb-[55px]">
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && post?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && post && (
				<div>
					{post.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}

		</div>
	);
};
export default Posts;