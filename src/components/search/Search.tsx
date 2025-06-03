import "./search.css"
import { SearchIcon } from "../../assets/SearchIcon"

export const Search = () => {
  return (
    <footer id="Footer">
      <form id="FormSearch" action="">
        <input id="InputSearch" type="text" />
        <button id="ButtonSearch">
          <SearchIcon />
        </button>
      </form>
    </footer>
  )
}