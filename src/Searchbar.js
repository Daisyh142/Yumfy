import {useState} from 'react';

const Searchbar = (onSearch) => {
    const [searchTerm, setSearchTerm] = useState("");

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim() !== ""){
            onSearch(searchTerm);
        }
    };

    return (
        <div className="container mt-1">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <form onSubmit={handleSubmit} className="d-flex">
                        <input
                            type="text"
                            className="form-control me-2"
                            placeholder="Search for Recipes"
                            value={searchTerm}
                            onChange={handleInputChange}
                        />
                        <button type="submit" className="btn btn-primary">
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Searchbar;